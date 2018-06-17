import serial
import time
import pynmea2

ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=10)

while 1:
    time.sleep(1)
    SERread = ser.readline(100)
    GPSread = ''
    #print('len ', len(SERread))
    GPSread += bytes.decode(SERread)

    #print('type: ', type(GPSread))
    #print('GPSread:', GPSread)
    GPSread_split = GPSread.split(",")
    print("Read in")

    if (GPSread_split[0] == "$GPGGA"):
        print(type(GPSread))
        print(GPSread)
        #msg = pynmea2.parse("$GPGGA,184353.07,1929.045,S,02410.506,E,1,04,2.6,100.00,M,-33.9,M,,0000*6D")
        msg = pynmea2.parse(GPSread)
        print(msg.longitude,"   ", msg.latitude)
        return(msg.longitude, msg.latitude)
    else:
        return (0,0)