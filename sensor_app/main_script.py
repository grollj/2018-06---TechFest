"""
A simple Python script to receive messages from a client over
Bluetooth using PyBluez (with Python 2).
"""
from bluepy.btle import Scanner, DefaultDelegate
import time
import RPi.GPIO as GPIO
from ctypes import *
import numpy as np
import requests
import json
import serial
import pynmea2

#pin assignment
test_led = 4

#pin init
GPIO.setwarnings(True)
GPIO.setmode(GPIO.BCM)
GPIO.setup(test_led, GPIO.OUT)
GPIO.output(test_led , 0)

################################
# Bluetooth - SECTION
################################

# Enter the MAC address of the sensor
RAW_SENSOR_ADDRESS = "80:ea:ca:80:02:52"
SENSOR_ADDRESS = ["80:ea:ca:80:02:52"]
SENSOR_LOCATION = ["Garage", "Exterior"]

class DecodeErrorException(Exception):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)


class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, dev, isNewDev, isNewData):
        x=1

scanner = Scanner().withDelegate(ScanDelegate())

def bluetooth_routine():
    #print("Start bluetooth scan")
    scanner = Scanner().withDelegate(ScanDelegate())
    ManuDataHex = []
    devices = scanner.scan(1.5)
    ManuData = ""
    #print("Stop scanning")

    entry = 0
    for dev in devices:
        for saddr in SENSOR_ADDRESS:
            entry += 1
            if (dev.addr == saddr):
                print("Device %s (%s), RSSI=%d dB" % (dev.addr, dev.addrType, dev.rssi))
                #CurrentDevAddr = saddr
                #CurrentDevLoc = SENSOR_LOCATION[entry - 1]
                for (adtype, desc, value) in dev.getScanData():
                    #print("  %s = %s" % (desc, value))
                    if (desc == "Manufacturer"):
                        ManuData = value

                if (ManuData == ""):
                    print("No data received, end decoding")
                    continue

                # print ManuData
                for i, j in zip(ManuData[::2], ManuData[1::2]):
                    ManuDataHex.append(int(i + j, 16))
    return filter_machine_data(dev.addr, ManuDataHex)


def filter_machine_data(DeviceID, raw_data):
    if len(raw_data)==0:
        print("Anzahl empfangener Bytes:", len(raw_data))
        return None
    elif len(raw_data) < 16:
        print("Anzahl empfangener Bytes:", len(raw_data))
        return None
    else:
        #msb_mac_addr = raw_data[7]
        DeviceType = raw_data[8]
        BattRuntime = raw_data[10] * 256 + raw_data[9];
        MotorSpeed = raw_data[14] * 50 # correction is necessary to reach RPM
        BattCurrent = raw_data[13]
        BattTemp = raw_data[16]
        SensorData = {'DeviceAddres': DeviceID,
                      'DeviceType': DeviceType,
                      'MotorSpeed': MotorSpeed,
                      'DeviceRuntime': BattRuntime,
                      'BattCurrent': BattCurrent,
                      'BattTemp': BattTemp}

        print(SensorData)
        return SensorData

################################
# IMU - SECTION
################################

def imu_call_preparation():

    lib.lsm9ds1_create.argtypes = []
    lib.lsm9ds1_create.restype = c_void_p

    lib.lsm9ds1_begin.argtypes = [c_void_p]
    lib.lsm9ds1_begin.restype = None

    lib.lsm9ds1_calibrate.argtypes = [c_void_p]
    lib.lsm9ds1_calibrate.restype = None

    lib.lsm9ds1_gyroAvailable.argtypes = [c_void_p]
    lib.lsm9ds1_gyroAvailable.restype = c_int
    lib.lsm9ds1_accelAvailable.argtypes = [c_void_p]
    lib.lsm9ds1_accelAvailable.restype = c_int
    lib.lsm9ds1_magAvailable.argtypes = [c_void_p]
    lib.lsm9ds1_magAvailable.restype = c_int

    lib.lsm9ds1_readGyro.argtypes = [c_void_p]
    lib.lsm9ds1_readGyro.restype = c_int
    lib.lsm9ds1_readAccel.argtypes = [c_void_p]
    lib.lsm9ds1_readAccel.restype = c_int
    lib.lsm9ds1_readMag.argtypes = [c_void_p]
    lib.lsm9ds1_readMag.restype = c_int

    lib.lsm9ds1_getGyroX.argtypes = [c_void_p]
    lib.lsm9ds1_getGyroX.restype = c_float
    lib.lsm9ds1_getGyroY.argtypes = [c_void_p]
    lib.lsm9ds1_getGyroY.restype = c_float
    lib.lsm9ds1_getGyroZ.argtypes = [c_void_p]
    lib.lsm9ds1_getGyroZ.restype = c_float

    lib.lsm9ds1_getAccelX.argtypes = [c_void_p]
    lib.lsm9ds1_getAccelX.restype = c_float
    lib.lsm9ds1_getAccelY.argtypes = [c_void_p]
    lib.lsm9ds1_getAccelY.restype = c_float
    lib.lsm9ds1_getAccelZ.argtypes = [c_void_p]
    lib.lsm9ds1_getAccelZ.restype = c_float

    lib.lsm9ds1_getMagX.argtypes = [c_void_p]
    lib.lsm9ds1_getMagX.restype = c_float
    lib.lsm9ds1_getMagY.argtypes = [c_void_p]
    lib.lsm9ds1_getMagY.restype = c_float
    lib.lsm9ds1_getMagZ.argtypes = [c_void_p]
    lib.lsm9ds1_getMagZ.restype = c_float

    lib.lsm9ds1_calcGyro.argtypes = [c_void_p, c_float]
    lib.lsm9ds1_calcGyro.restype = c_float
    lib.lsm9ds1_calcAccel.argtypes = [c_void_p, c_float]
    lib.lsm9ds1_calcAccel.restype = c_float
    lib.lsm9ds1_calcMag.argtypes = [c_void_p, c_float]
    lib.lsm9ds1_calcMag.restype = c_float


try:
    path = "./LSM9DS1_RaspberryPi_Library/lib/liblsm9ds1cwrapper.so"
    lib = cdll.LoadLibrary(path)
except:
    print("IMU Lib not found")

imu_call_preparation()

imu = lib.lsm9ds1_create()
lib.lsm9ds1_begin(imu)
if lib.lsm9ds1_begin(imu) == 0:
    print("Failed to communicate with LSM9DS1.")
    quit()
lib.lsm9ds1_calibrate(imu)
print("Calibration done...!")
def imu_call():
    while lib.lsm9ds1_gyroAvailable(imu) == 0:
        pass
    lib.lsm9ds1_readGyro(imu)
    while lib.lsm9ds1_accelAvailable(imu) == 0:
        pass
    lib.lsm9ds1_readAccel(imu)
    while lib.lsm9ds1_magAvailable(imu) == 0:
        pass
    lib.lsm9ds1_readMag(imu)

    gx = lib.lsm9ds1_getGyroX(imu)
    gy = lib.lsm9ds1_getGyroY(imu)
    gz = lib.lsm9ds1_getGyroZ(imu)

    ax = lib.lsm9ds1_getAccelX(imu)
    ay = lib.lsm9ds1_getAccelY(imu)
    az = lib.lsm9ds1_getAccelZ(imu)

    mx = lib.lsm9ds1_getMagX(imu)
    my = lib.lsm9ds1_getMagY(imu)
    mz = lib.lsm9ds1_getMagZ(imu)

    cgx = lib.lsm9ds1_calcGyro(imu, gx)
    cgy = lib.lsm9ds1_calcGyro(imu, gy)
    cgz = lib.lsm9ds1_calcGyro(imu, gz)

    cax = lib.lsm9ds1_calcAccel(imu, ax)
    cay = lib.lsm9ds1_calcAccel(imu, ay)
    caz = lib.lsm9ds1_calcAccel(imu, az)

    cmx = lib.lsm9ds1_calcMag(imu, mx)
    cmy = lib.lsm9ds1_calcMag(imu, my)
    cmz = lib.lsm9ds1_calcMag(imu, mz)

    gyro_vec = np.array([cgx,cgy,cgz])
    accel_vec = np.array([cax, cay, caz])
    mag_vec = np.array([cmx, cmy, cmz])

    return gyro_vec, accel_vec, mag_vec

def imu_routine():
    gyro_vec, accel_vec, mag_vec = imu_call()
    i=0
    while i <15:
        i = i+1
        gyro_inc, accel_inc, mag_inc = imu_call()
        gyro_vec = (1- (1/i)) * gyro_vec  + (1/i) * gyro_inc
        accel_vec = (1 - (1 / i)) * accel_vec + (1 / i) * accel_inc
        mag_vec = (1 - (1 / i)) * mag_vec + (1 / i) * mag_inc

    #print("----------------------------------- Gyro Summe: ",np.sum(gyro_vec))
    #print("Gyro: %f, %f, %f [deg/s]" % (cgx, cgy, cgz))
    #print("Accel: %f, %f, %f [Gs]" % (cax, cay, caz))
    #print("Mag: %f, %f, %f [gauss]" % (cmx, cmy, cmz))
    return accel_vec

def calculate_machine_status(activity_parameter, accel_vec):
    '''SensorData = {'DeviceAddres': DeviceID,
                  'DeviceType': DeviceType,
                  'MotorSpeed': MotorSpeed,
                  'DeviceRuntime': BattRuntime,
                  'BattCurrent': BattCurrent,
                  'BattTemp': BattTemp}
    '''
    if activity_parameter == None:
        return "Waiting for input"
    else:
        MotorSpeed = activity_parameter["MotorSpeed"]
        BattCurrent = activity_parameter["BattCurrent"]

        if get_machine_typ(activity_parameter) == "Motorsäge - Stihl MSA 120C":
            if BattCurrent > 1 or MotorSpeed > 1:
                if abs(accel_vec[2]) > 0.7 and (abs(accel_vec[0]) <0.6 and abs(accel_vec[1])< 0.3):
                    return "Cutting trunks"
                elif abs(accel_vec[0]) > 0.55 and abs(accel_vec[1])< 0.2:
                    return "Felling tree"
                else:
                    return "Felling tree"

            else:
                return "inactive"
        elif get_machine_typ(activity_parameter) == "Laubbläser - Stihl BGA 56":
            if BattCurrent > 1 or MotorSpeed > 1:
                return 'active'
            else:
                return "inactive"
        else:
            return "Unknown Action"

#Serial interface for GPS module
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=10)


def get_current_position():
    '''
    i= 0
    while i < 5:
        SERread = ser.readline(100)
        GPSread = ''
        # print('len ', len(SERread))
        GPSread += bytes.decode(SERread)

        # print('type: ', type(GPSread))
        # print('GPSread:', GPSread)
        GPSread_split = GPSread.split(",")
        #print("Read in")

        if (GPSread_split[0] == "$GPGGA"):
            #print(type(GPSread))
            #print(GPSread)
            # msg = pynmea2.parse("$GPGGA,184353.07,1929.045,S,02410.506,E,1,04,2.6,100.00,M,-33.9,M,,0000*6D")
            msg = pynmea2.parse(GPSread)
            print(msg.longitude, "   ", msg.latitude)
            if (msg.latitude == 0) or (msg.longitude):
                return (48.269310, 11.664914)
            else:
                return (msg.latitude, msg.longitude)
        else:
            pass

    print("No valid position")
    '''
    return (48.269310, 11.664914)

def post_to_server(time, id, position, machine_status):
    url = 'https://tf18.alxndr.de/api'
    message = {'time': time,
               'ID': id,
               'position_long': position[0],
               'position_lat': position[1],
               'status': machine_status,
               #'parameter_battery_level':
               }
    r = requests.post(url, json = message)

def get_machine_typ(activity_parameter):
    if activity_parameter == None:
        return "not available"
    DeviceType = activity_parameter["DeviceType"]
    if DeviceType == 169:
        return "Motorsäge - Stihl MSA 120C"
    elif DeviceType == 143:
        return "Laubbläser - Stihl BGA 56"
    else:
        return "Unknown Device"


def main():
    last_timestamp = 0
    prev_machine_status = 'inactive'
    cur_position = get_current_position()

    while 1:
        #print("Start Loop")

        activity_parameter = bluetooth_routine()
        #activity_parameter = None
        '''activity_parameter = {'DeviceAddres': 12,
                            'DeviceType': 169,
                            'MotorSpeed': 10,
                            'DeviceRuntime': 12,
                            'BattCurrent': 2,
                            'BattTemp': 12}
        '''

        accel_vec = imu_routine()
        #print("Accel: %f, %f, %f [deg/s]" % (accel_vec[0], accel_vec[1], accel_vec[2]))

        cur_machine_status = calculate_machine_status(activity_parameter, accel_vec)
        #print("Rückgabewert Machinenstatus: ",cur_machine_status)

        cur_timestamp = time.time()
        cur_position = get_current_position()
        print("Current Position of device: ", cur_position)
        if (cur_machine_status != prev_machine_status):# or (cur_timestamp - last_timestamp > 15):
            print("Start post to server --- ", cur_machine_status)
            if cur_machine_status != 'inactive' or cur_machine_status != 'not available':
                post_to_server(cur_timestamp,get_machine_typ(activity_parameter), cur_position, cur_machine_status)
            #update parameter
            last_timestamp = cur_timestamp
            prev_machine_status = cur_machine_status

        #print("Finished Loop - waiting")
        #time.sleep(5)
main()
