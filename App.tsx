import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Vibration, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons

export default function App() {
  const [rounds, setRounds] = useState(3); // Default 3 rounds
  const [roundTime, setRoundTime] = useState(3); // Default 3 min round
  const [breakTime, setBreakTime] = useState(1); // Default 1 min break
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAlarmSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load the alarm sound
  const loadAlarmSound = async () => {
    const { sound: alarmSound } = await Audio.Sound.createAsync(
      require('./assets/alarm.mp3')
    );
    setSound(alarmSound);
  };

  const startTimer = () => {
    setIsRunning(true);
    setCurrentRound(1);
    setTimer(roundTime * 60);
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current!);
  };

  const resetTimer = () => {
    stopTimer();
    setRounds(3);
    setRoundTime(3);
    setBreakTime(1);
    setCurrentRound(0);
    setTimer(0);
    setIsBreak(false);
  };

  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      if (isBreak) {
        // Break finished
        setIsBreak(false);
        setCurrentRound((prev) => prev + 1);
        if (currentRound < rounds) {
          setTimer(roundTime * 60); // Next round
        } else {
          stopTimer();
          alert("All rounds complete!");
        }
      } else {
        // Round finished, start break
        setIsBreak(true);
        setTimer(breakTime * 60); // Set break time
        playAlarm();
      }
    }
    return () => clearInterval(intervalRef.current!);
  }, [timer, isRunning]);

  // Play alarm sound
  const playAlarm = async () => {
    await sound!.replayAsync();
    Vibration.vibrate(1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boxing Timer</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Number of Rounds:</Text>
        <View style={styles.adjustmentContainer}>
          <TouchableOpacity onPress={() => setRounds(Math.max(rounds - 1, 1))}>
            <FontAwesome name="minus" size={24} color="#f5f5f5" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rounds.toString()}
            onChangeText={(text) => setRounds(Math.max(Number(text), 1))}
          />
          <TouchableOpacity onPress={() => setRounds(rounds + 1)}>
            <FontAwesome name="plus" size={24} color="#f5f5f5" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Round Time (minutes):</Text>
        <View style={styles.adjustmentContainer}>
          <TouchableOpacity onPress={() => setRoundTime(Math.max(roundTime - 1, 1))}>
            <FontAwesome name="minus" size={24} color="#f5f5f5" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={roundTime.toString()}
            onChangeText={(text) => setRoundTime(Math.max(Number(text), 1))}
          />
          <TouchableOpacity onPress={() => setRoundTime(roundTime + 1)}>
            <FontAwesome name="plus" size={24} color="#f5f5f5" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Break Time (minutes):</Text>
        <View style={styles.adjustmentContainer}>
          <TouchableOpacity onPress={() => setBreakTime(Math.max(breakTime - 1, 1))}>
            <FontAwesome name="minus" size={24} color="#f5f5f5" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={breakTime.toString()}
            onChangeText={(text) => setBreakTime(Math.max(Number(text), 1))}
          />
          <TouchableOpacity onPress={() => setBreakTime(breakTime + 1)}>
            <FontAwesome name="plus" size={24} color="#f5f5f5" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.timerText}>
        {isBreak ? "Break" : `Round ${currentRound}`} - {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startTimer} disabled={isRunning}>
          <Text style={styles.buttonText}>Start Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopTimer} disabled={!isRunning}>
          <Text style={styles.buttonText}>Stop Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetTimer}>
          <FontAwesome name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#61dafb',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#f5f5f5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#61dafb',
    width: 80,
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
  },
  adjustmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#f5f5f5',
    marginVertical: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4caf50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  resetButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    fontSize: 18,}});
