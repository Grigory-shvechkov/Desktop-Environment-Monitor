#include <iostream>
#include <string>
#include <cstring>      // For memset
#include <unistd.h>     // For close()
#include <arpa/inet.h>  // For sockaddr_in, inet_pton
#include <sys/socket.h> // For socket functions
#include <thread>
#include <chrono>


//using local libaries -lwiringPi -lwiringPiDev
#include <wiringPi.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#define MAXTIMINGS	85
#define DHTPIN		7
int dht11_dat[5] = { 0, 0, 0, 0, 0 };


#define SERVER_IP "192.168.0.187" // The IP address of the server
#define PORT 8080             // The port to connect to





char* read_dht11_dat() {
    uint8_t laststate = HIGH;
    uint8_t counter = 0;
    uint8_t j = 0, i;
    static char result[100]; // Static array to store the result string
    
    dht11_dat[0] = dht11_dat[1] = dht11_dat[2] = dht11_dat[3] = dht11_dat[4] = 0;

    pinMode(DHTPIN, OUTPUT);
    digitalWrite(DHTPIN, LOW);
    delay(18);
    digitalWrite(DHTPIN, HIGH);
    delayMicroseconds(40);
    pinMode(DHTPIN, INPUT);

    for (i = 0; i < MAXTIMINGS; i++) {
        counter = 0;
        while (digitalRead(DHTPIN) == laststate) {
            counter++;
            delayMicroseconds(1);
            if (counter == 255) {
                break;
            }
        }
        laststate = digitalRead(DHTPIN);

        if (counter == 255) break;

        if ((i >= 4) && (i % 2 == 0)) {
            dht11_dat[j / 8] <<= 1;
            if (counter > 16)
                dht11_dat[j / 8] |= 1;
            j++;
        }
    }

    if ((j >= 40) &&
        (dht11_dat[4] == ((dht11_dat[0] + dht11_dat[1] + dht11_dat[2] + dht11_dat[3]) & 0xFF))) {
        
        float humidity, temperature;
        humidity = dht11_dat[0] + dht11_dat[1] / 100.0;
        temperature = dht11_dat[2] + dht11_dat[3] / 100.0;

        // Create the string and return it
        snprintf(result, sizeof(result), "%.1f,%.1f", temperature, humidity);
        return result;
    } else {
        return NULL; // Return error message
    }
}


int main()
{
    int client_sock;
    struct sockaddr_in server_addr;
    // char buffer[2048];  // Buffer to receive aggregated messages
    std::string message;
    std::string user;

    // Create the client socket
    client_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (client_sock < 0)
    {
        perror("Socket creation failed");
        return -1;
    }

    // Prepare the server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);

    // Convert the server IP address from text to binary
    if (inet_pton(AF_INET, SERVER_IP, &server_addr.sin_addr) <= 0)
    {
        perror("Invalid address or address not supported");
        close(client_sock);
        return -1;
    }

    // Connect to the server
    if (connect(client_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        perror("Connection failed");
        close(client_sock);
        return -1;
    }

    std::cout << "Connected to the server." << std::endl;


    //setup sensor

    if ( wiringPiSetup() == -1 ){
        std::cout << "sensor error";
		exit( 1 );

    }

    // Communicate with the server
    while (true)
    {

        //continously send string 


        //std::string message = "MYMESSAGE";

         char* result = read_dht11_dat();

        if (result != NULL){
            printf("%s\n", result);
            send(client_sock, result, strlen(result), 0);
        }
        else
        {
            std::cout << "Bad data, not sending" << std::endl;

        }
        

        std::this_thread::sleep_for(std::chrono::seconds(1));
       
        
    }

    // Close the client socket
    close(client_sock);
    return 0;
}
//compile command g++ -o client client.cpp -lwiringPi -lwiringPiDev