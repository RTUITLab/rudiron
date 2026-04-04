import { useState } from "react";
import SimpleCode from "../SimpleCode";
import styles from "./Ideas.module.scss";

const ideas = [
  {
    id: 1,
    title: "Мигание светодиода",
    difficulty: "⭐",
    description: "Мигать светодиодом постоянно, пока устройство не будет отключено.",
    code: `
from machine import Pin
import time

led = Pin(2, Pin.OUT)

if __name__ == '__main__':
    while True:
        led.value(1)
        time.sleep(0.5)
        led.value(0)
        time.sleep(0.5)
    `
  },
  {
    id: 2,
    title: "Сигнал SOS",
    difficulty: "⭐⭐",
    description: "Светодиод передаёт сигнал бедствия по азбуке Морзе.",
    code: `
from machine import Pin
import time

led = Pin(2, Pin.OUT)

def blink(t):
    led.value(1)
    time.sleep(t)
    led.value(0)
    time.sleep(0.2)

if __name__ == '__main__':
    while True:
        blink(0.3)  # S
        blink(0.3)  # S
        blink(0.3)  # S
        time.sleep(0.2)
        blink(0.8)  # O
        blink(0.8)  # O
        blink(0.8)  # O
        time.sleep(0.2)
        blink(0.3)  # S
        blink(0.3)  # S
        blink(0.3)  # S
        time.sleep(1)  # пауза между циклами
    `
  }
];

export default function Ideas() {
  const [openCodeId, setOpenCodeId] = useState<number | null>(null);

  const toggleCode = (id: number | null) => {
    setOpenCodeId(openCodeId === id ? null : id);
  };

  return (
    <div className={styles.ideas}>
      <div className={styles.ideas__list}>
        {ideas.map((idea) => (
          <div className={styles.idea} key={idea.id}>
            <h3>{idea.title}</h3>
            <span className={styles.difficulty}>{idea.difficulty}</span>
            <p>{idea.description}</p>
            <label 
              className={styles.code__label} 
              onClick={() => toggleCode(idea.id)}
            >
              {openCodeId === idea.id ? "Скрыть код" : "Подсказка в виде кода"}
            </label>
            <div className={`${styles.code__wrapper} ${openCodeId === idea.id ? styles.code__wrapper_open : ""}`}>
                <span className={styles.code__label__wrapper}>Пример кода, который можно использовать для реализации идеи:</span>
              {idea.code && <SimpleCode code={idea.code} language="python" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}