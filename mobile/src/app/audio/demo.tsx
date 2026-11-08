import { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AUDIO_SOURCE = require("../../../assets/audio/storyverse-demo.wav");

const AUDIO_PROGRESS_KEY = "storyverse.audio.demo.position.v1";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

const SLEEP_OPTIONS = [0, 1, 5, 10, 15] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function AudioDemoScreen() {
  const player = useAudioPlayer(AUDIO_SOURCE, {
    updateInterval: 500,
  });

  const status = useAudioPlayerStatus(player);

  const [speed, setSpeed] = useState(1);
  const [pendingResume, setPendingResume] = useState<number | null>(
    null
  );
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const lastSavedSecond = useRef(-1);

  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix",
    }).catch(() => {
      setPlayerError("Unable to configure the audio session.");
    });

    let mounted = true;

    void Storage.getItem(AUDIO_PROGRESS_KEY)
      .then((value) => {
        if (!mounted || value === null) {
          return;
        }

        const seconds = Number(value);

        if (Number.isFinite(seconds) && seconds >= 0) {
          setPendingResume(seconds);
        }
      })
      .catch(() => {
        if (mounted) {
          setPlayerError("Saved listening progress could not be loaded.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      !status.isLoaded ||
      status.duration <= 0 ||
      pendingResume === null
    ) {
      return;
    }

    const position = Math.max(
      0,
      Math.min(pendingResume, status.duration - 1)
    );

    void player
      .seekTo(position)
      .then(() => {
        setPendingResume(null);
      })
      .catch(() => {
        setPendingResume(null);
        setPlayerError("Unable to resume saved audio position.");
      });
  }, [
    player,
    pendingResume,
    status.isLoaded,
    status.duration,
  ]);

  useEffect(() => {
    if (!status.isLoaded || !status.playing) {
      return;
    }

    const second = Math.floor(status.currentTime);

    if (
      second > 0 &&
      second % 5 === 0 &&
      second !== lastSavedSecond.current
    ) {
      lastSavedSecond.current = second;

      void Storage.setItem(
        AUDIO_PROGRESS_KEY,
        String(status.currentTime)
      ).catch(() => {
        setPlayerError("Unable to save listening progress.");
      });
    }
  }, [
    status.currentTime,
    status.isLoaded,
    status.playing,
  ]);

  useEffect(() => {
    if (status.didJustFinish) {
      void Storage.setItem(AUDIO_PROGRESS_KEY, "0").catch(() => {
        setPlayerError("Unable to reset listening progress.");
      });
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    return () => {
      if (sleepTimer.current !== null) {
        clearTimeout(sleepTimer.current);
      }
    };
  }, []);

  function persistPosition(seconds: number) {
    void Storage.setItem(
      AUDIO_PROGRESS_KEY,
      String(Math.max(0, seconds))
    ).catch(() => {
      setPlayerError("Unable to save listening position.");
    });
  }

  function togglePlayback() {
    if (!status.isLoaded) {
      return;
    }

    if (status.playing) {
      player.pause();
      persistPosition(status.currentTime);
      return;
    }

    if (
      status.duration > 0 &&
      status.currentTime >= status.duration - 0.5
    ) {
      void player.seekTo(0).then(() => {
        player.play();
      });
    } else {
      player.play();
    }
  }

  function seekRelative(seconds: number) {
    if (!status.isLoaded) {
      return;
    }

    const target = Math.max(
      0,
      Math.min(
        status.duration,
        status.currentTime + seconds
      )
    );

    void player.seekTo(target).then(() => {
      persistPosition(target);
    }).catch(() => {
      setPlayerError("Unable to seek within the audiobook.");
    });
  }

  function changeSpeed(nextSpeed: number) {
    player.setPlaybackRate(nextSpeed);
    setSpeed(nextSpeed);
  }

  function changeSleepTimer(minutes: number) {
    if (sleepTimer.current !== null) {
      clearTimeout(sleepTimer.current);
      sleepTimer.current = null;
    }

    setSleepMinutes(minutes);

    if (minutes > 0) {
      sleepTimer.current = setTimeout(() => {
        player.pause();
        persistPosition(player.currentTime);
        setSleepMinutes(0);
        sleepTimer.current = null;
      }, minutes * 60 * 1000);
    }
  }

  function closePlayer() {
    persistPosition(status.currentTime);
    player.pause();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  const duration =
    Number.isFinite(status.duration) && status.duration > 0
      ? status.duration
      : 0;

  const currentTime =
    Number.isFinite(status.currentTime) &&
    status.currentTime >= 0
      ? status.currentTime
      : 0;

  const progress =
    duration > 0
      ? Math.max(0, Math.min(100, (currentTime / duration) * 100))
      : 0;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close audiobook player"
            onPress={closePlayer}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              color="#FFFFFF"
              size={24}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Now Listening
          </Text>

          <Ionicons
            name="headset-outline"
            size={23}
            color="#D4AEFF"
          />
        </View>

        <LinearGradient
          colors={["#704F70", "#372744", "#191622"]}
          style={styles.cover}
        >
          <Ionicons
            name="rainy-outline"
            color="#F4E6FF"
            size={72}
          />

          <Text style={styles.coverEyebrow}>
            STORYVERSE ORIGINALS
          </Text>

          <Text style={styles.coverTitle}>
            The Last Monsoon
          </Text>

          <Text style={styles.coverSubtitle}>
            A StoryVerse Audio Experience
          </Text>
        </LinearGradient>

        <Text style={styles.chapterName}>
          The Letter
        </Text>

        <Text style={styles.narrator}>
          Development narration preview
        </Text>

        <View style={styles.demoBadge}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#D7B3FF"
          />

          <Text style={styles.demoBadgeText}>
            Test voice only - premium AI narration comes later
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)}
            </Text>

            <Text style={styles.timeText}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rewind 10 seconds"
            disabled={!status.isLoaded}
            onPress={() => seekRelative(-10)}
            style={styles.skipButton}
          >
            <Ionicons
              name="play-back"
              size={31}
              color="#DDD4E9"
            />

            <Text style={styles.skipLabel}>
              10s
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              status.playing ? "Pause audio" : "Play audio"
            }
            disabled={!status.isLoaded}
            onPress={togglePlayback}
            style={[
              styles.playButton,
              !status.isLoaded && styles.disabledButton,
            ]}
          >
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={35}
              color="#1D1329"
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip forward 10 seconds"
            disabled={!status.isLoaded}
            onPress={() => seekRelative(10)}
            style={styles.skipButton}
          >
            <Ionicons
              name="play-forward"
              size={31}
              color="#DDD4E9"
            />

            <Text style={styles.skipLabel}>
              10s
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Playback speed
        </Text>

        <View style={styles.optionRow}>
          {SPEEDS.map((option) => {
            const selected = speed === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => changeSpeed(option)}
                style={[
                  styles.option,
                  selected && styles.optionActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextActive,
                  ]}
                >
                  {option}x
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>
          Sleep timer
        </Text>

        <Text style={styles.sectionNote}>
          This demo timer is intended for foreground testing.
        </Text>

        <View style={styles.optionRow}>
          {SLEEP_OPTIONS.map((minutes) => {
            const selected = sleepMinutes === minutes;

            return (
              <Pressable
                key={minutes}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => changeSleepTimer(minutes)}
                style={[
                  styles.option,
                  selected && styles.optionActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextActive,
                  ]}
                >
                  {minutes === 0 ? "Off" : `${minutes}m`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {status.error && (
          <Text style={styles.errorText}>
            Audio error: {status.error}
          </Text>
        )}

        {playerError && (
          <Text style={styles.errorText}>
            {playerError}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#090B12",
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 55,
  },
  header: {
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 45,
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  cover: {
    height: 310,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  coverEyebrow: {
    fontSize: 10,
    color: "#EAD8F7",
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 23,
  },
  coverTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 12,
  },
  coverSubtitle: {
    color: "#E0D0EC",
    fontSize: 12,
    marginTop: 9,
  },
  chapterName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 27,
  },
  narrator: {
    color: "#A9A6BB",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  demoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 13,
    backgroundColor: "#241C32",
    padding: 12,
    marginTop: 20,
  },
  demoBadgeText: {
    color: "#D7C6E6",
    fontSize: 11,
    flex: 1,
  },
  progressSection: {
    marginTop: 32,
  },
  progressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#323044",
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    backgroundColor: "#D6B1FF",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeText: {
    color: "#A9A5BC",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: 23,
  },
  skipButton: {
    alignItems: "center",
    gap: 5,
    padding: 12,
  },
  skipLabel: {
    color: "#AFA9C2",
    fontSize: 11,
  },
  playButton: {
    width: 78,
    height: 78,
    backgroundColor: "#D7B3FF",
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  sectionTitle: {
    color: "#F5F2FF",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 35,
    marginBottom: 14,
  },
  sectionNote: {
    color: "#9390A8",
    fontSize: 12,
    marginBottom: 13,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  option: {
    borderWidth: 1,
    borderColor: "#373449",
    backgroundColor: "#181A27",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
  },
  optionActive: {
    backgroundColor: "#3B2850",
    borderColor: "#C69AEF",
  },
  optionText: {
    color: "#B8B4C8",
    fontSize: 12,
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#E4CEFF",
  },
  errorText: {
    color: "#F0A4A4",
    fontSize: 12,
    marginTop: 20,
  },
});