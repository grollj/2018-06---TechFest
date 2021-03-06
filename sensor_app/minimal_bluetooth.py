# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

# bscan.py - Simple bluetooth LE scanner and data extractor

from bluepy.btle import Scanner, DefaultDelegate
import time

#import paho.mqtt.publish as publish
#import struct
#import json

#MQTT_SERVER = "192.168.178.58"
#MQTT_PATH = "Connector"

# Enter the MAC address of the sensor from the lescan
RAW_SENSOR_ADDRESS = "80:ea:ca:80:02:57"
SENSOR_ADDRESS = ["80:ea:ca:80:02:57"]
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
        #if isNewDev:
            #print("Discovered device", dev.addr)
        #elif isNewData:
            #print("Received new data from", dev.addr)


scanner = Scanner().withDelegate(ScanDelegate())
ManuDataHex = []
ReadLoop = True
try:
    while (ReadLoop):
        print("Entre Loop")
        scanner = Scanner().withDelegate(ScanDelegate())
        ManuDataHex = []
        devices = scanner.scan(5.0)
        ManuData = ""
        print("Stop scanning")

        for dev in devices:
            entry = 0
            AcceleroData = 0
            AcceleroType = 0
            TempData = 0
            deviceRuntime = 0
            for saddr in SENSOR_ADDRESS:
                entry += 1
                if (dev.addr == saddr):
                    print("Device %s (%s), RSSI=%d dB" % (dev.addr, dev.addrType, dev.rssi))
                    CurrentDevAddr = saddr
                    CurrentDevLoc = SENSOR_LOCATION[entry - 1]
                    for (adtype, desc, value) in dev.getScanData():
                        print("  %s = %s" % (desc, value))
                        if (desc == "Manufacturer"):
                            ManuData = value

                    if (ManuData == ""):
                        print("No data received, end decoding")
                        continue

                    # print ManuData
                    for i, j in zip(ManuData[::2], ManuData[1::2]):
                        ManuDataHex.append(int(i + j, 16))

                    MSB_macaddr = ManuDataHex[7]
                    RPM_motor = ManuDataHex[14]
                    deviceRuntime = (ManuDataHex[12] * 16777216) + (ManuDataHex[11] * 65536) + (
                    ManuDataHex[10] * 256) + (ManuDataHex[9]);
                    SensorData = {'DeviceAddres': dev.addr, 'RPM_motor': RPM_motor}
                    #json_string = json.dumps(SensorData)
                    print(SensorData)
                    #json_string
                    #publish.single(MQTT_PATH, json_string, hostname=MQTT_SERVER)
                    ReadLoop = True
                    time.sleep(2)

except DecodeErrorException:
    pass