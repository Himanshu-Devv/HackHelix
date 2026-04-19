"""
signal_to_features.py
=====================
Converts raw 6-signal input (keystroke + mouse events) collected by the
Chrome extension into the 8 features the trained model expects.
"""

import math
import statistics
import pandas as pd
import joblib

# ── Keys to exclude from WPM count ───────────────────────────────────────────
NON_CHAR_KEYS = {
    "backspace", "delete", "shift", "lshift", "rshift",
    "ctrl", "lctrl", "rctrl", "alt", "lalt", "ralt",
    "tab", "escape", "enter", "return", "capslock", "caps_lock",
    "arrowleft", "arrowright", "arrowup", "arrowdown",
    "left", "right", "up", "down",
    "meta", "super", "win", "fn",
    "f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12",
}

ERROR_KEYS = {"backspace", "delete"}


# =============================================================================
# MAIN CONVERTER
# =============================================================================

def compute_features(keystrokes: list[dict], mouse_samples: list[dict]) -> dict:
    features = {
        "wpm":             0.0,
        "error_rate":      0.0,
        "mean_hold_ms":    120.0,   # safe defaults (model median)
        "std_hold_ms":     40.0,
        "mean_flight_ms":  150.0,
        "std_flight_ms":   60.0,
        "mean_speed_norm": 0.5,
        "jitter":          0.1,
    }

    # ── KEYBOARD FEATURES ─────────────────────────────────────────────────────
    if keystrokes:

        n_total  = len(keystrokes)
        n_errors = sum(1 for e in keystrokes
                       if e["key"].lower() in ERROR_KEYS)

        # 1. Error rate
        features["error_rate"] = n_errors / n_total if n_total > 0 else 0.0

        # 2. WPM
        char_events = [e for e in keystrokes
                       if e["key"].lower() not in NON_CHAR_KEYS
                       and len(e["key"]) == 1]

        if len(char_events) >= 2:
            t_start = char_events[0]["keydown_ms"]
            t_end   = char_events[-1]["keydown_ms"]
            duration_min = (t_end - t_start) / 1000 / 60
            if duration_min > 0:
                features["wpm"] = (len(char_events) / 5) / duration_min

        # 3. Hold time  (keyup − keydown per key)
        hold_times = []
        for e in keystrokes:
            hold = e["keyup_ms"] - e["keydown_ms"]
            if 10 < hold < 1500:          # filter stuck / noise
                hold_times.append(hold)

        if len(hold_times) >= 2:
            features["mean_hold_ms"] = statistics.mean(hold_times)
            features["std_hold_ms"]  = statistics.stdev(hold_times)
        elif len(hold_times) == 1:
            features["mean_hold_ms"] = hold_times[0]

        # 4. Flight time  (keydown[i+1] − keydown[i])
        keydown_times = [e["keydown_ms"] for e in keystrokes]
        flight_times  = []
        for i in range(1, len(keydown_times)):
            flight = keydown_times[i] - keydown_times[i - 1]
            if 0 < flight < 3000:         # filter pauses / outliers
                flight_times.append(flight)

        if len(flight_times) >= 2:
            features["mean_flight_ms"] = statistics.mean(flight_times)
            features["std_flight_ms"]  = statistics.stdev(flight_times)
        elif len(flight_times) == 1:
            features["mean_flight_ms"] = flight_times[0]

    # ── MOUSE FEATURES ────────────────────────────────────────────────────────
    if len(mouse_samples) >= 2:

        speeds = []
        for i in range(1, len(mouse_samples)):
            dx = mouse_samples[i]["x"]   - mouse_samples[i-1]["x"]
            dy = mouse_samples[i]["y"]   - mouse_samples[i-1]["y"]
            dt = mouse_samples[i]["t_ms"] - mouse_samples[i-1]["t_ms"]

            if dt <= 0:
                continue

            distance = math.sqrt(dx**2 + dy**2)   # pixels
            speed    = distance / dt               # px / ms
            speeds.append(speed)

        # Remove outliers beyond 3 std devs
        if len(speeds) >= 4:
            mean_s = statistics.mean(speeds)
            std_s  = statistics.stdev(speeds)
            speeds = [s for s in speeds
                      if abs(s - mean_s) <= 3 * std_s]

        if speeds:
            mean_speed = statistics.mean(speeds)

            features["mean_speed_norm"] = min(mean_speed / 5.0, 1.0)

            # 6. Jitter — MAD of speed (tremor / instability proxy)
            mad = statistics.mean([abs(s - mean_speed) for s in speeds])
            features["jitter"] = min(mad / 5.0, 1.0)   # same scale as speed

    return features


FEATURE_ORDER = [
    "wpm", "error_rate", "mean_speed_norm", "jitter",
    "mean_hold_ms", "std_hold_ms", "mean_flight_ms", "std_flight_ms",
]

def to_dataframe(features: dict) -> pd.DataFrame:
    """Returns a single-row DataFrame in the exact column order the model needs."""
    return pd.DataFrame([features])[FEATURE_ORDER]

LEVEL_LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}

class CognitiveLoadInference:
    def __init__(self, models_dir: str = "../model/models_v2"):
        self.score_model = joblib.load(f"{models_dir}/score_model.pkl")
        self.level_model = joblib.load(f"{models_dir}/level_model.pkl")
        print(f"Models loaded from {models_dir}/")

    def predict(self, keystrokes: list[dict], mouse_samples: list[dict]) -> dict:
        features = compute_features(keystrokes, mouse_samples)
        df       = to_dataframe(features)

        score  = float(self.score_model.predict(df)[0])
        level  = int(self.level_model.predict(df)[0])
        probas = self.level_model.predict_proba(df)[0]

        return {
            "score":       round(score, 1),          # 0–100
            "level":       LEVEL_LABELS[level],      # LOW / MEDIUM / HIGH
            "conf_low":    round(float(probas[0]), 3),
            "conf_medium": round(float(probas[1]), 3),
            "conf_high":   round(float(probas[2]), 3),
            "features":    features,                 # raw features for logging
        }
