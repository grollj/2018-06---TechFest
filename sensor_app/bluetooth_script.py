"""
A simple Python script to receive messages from a client over
Bluetooth using PyBluez (with Python 2).
"""
import bluetooth
import time
import RPi.GPIO as GPIO
import select

#import gps


#pin assignment
test_led = 4

#pin init
GPIO.setwarnings(True)
GPIO.setmode(GPIO.BCM)
GPIO.setup(test_led, GPIO.OUT)
GPIO.output(test_led , 0)

#bluetooth setup
hostMACAddress = '00:1f:e1:dd:08:3d' # The MAC address of a Bluetooth adapter on the server. The server might have multiple Bluetooth adapters.
port = 3
backlog = 1
size = 1024
bt_socket = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
bt_socket.bind((hostMACAddress, port))
bt_socket.listen(backlog)
bt_socket.settimeout(1)

def bluetooth_routine(client):
    print("Listening to  bluetooth")
    data = client.recv(size)
    if data:
        print(data)

def imu_routine():
    print("Read out imu data")

def main():
    try:
        bt_client, bt_clientInfo = bt_socket.accept()
    except:
        print("Closing socket")
        bt_client.close()
        bt_socket.close()
        bt_socket = None

    while 1:
        if bt_socket != None:
            bluetooth_routine(bt_client)
        imu_routine()