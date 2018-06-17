import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(14, GPIO.OUT)

while True:
    GPIO.output(14, True)
    time.sleep(1)
    GPIO.output(14, False)
    time.sleep(1)set