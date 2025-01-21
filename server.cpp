#include <iostream>
#include <string>
#include <cstring>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <map>
#include <thread>
#include <vector>
#include <mutex>
#include <sstream>
#include <string>


#include <iostream>
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/exception.h>
#include <cppconn/prepared_statement.h>

#define PORT 8080

// Store clients in a vector, where each client will have its own socket descriptor
// std::vector<int> clients;
std::mutex clients_mutex; // Mutex to protect client list
std::map<int, std::string> clients;

void client_handler(int client_socket)
{
    char buffer[2048] = {0};

    try
    {
        // Create a MySQL driver
        sql::mysql::MySQL_Driver *driver = sql::mysql::get_driver_instance();

        // Create a connection to the MySQL database
        sql::Connection *con = driver->connect("tcp://127.0.0.1:3306", "timmothy", "@Ubuntu1289");

        // Select the database
        con->setSchema("sensor_data");

        while (true)
        {
            int bytes_read = read(client_socket, buffer, sizeof(buffer) - 1);

            if (bytes_read < 0)
            {
                std::cerr << "Read failed!" << std::endl;
                break;
            }
            else if (bytes_read == 0)
            {
                // Handle client disconnect
                std::cout << "Client disconnected: " << client_socket << std::endl;
                break;
            }
            else
            {
                buffer[bytes_read] = '\0'; // Null-terminate the buffer to make it a string
                std::cout << "Received data: " << buffer << std::endl;

                // Convert buffer to std::string for safer handling
                std::string message(buffer);

                // Use stringstream to split the message into temperature and humidity
                std::stringstream ss(message);
                std::string temp_str, hum_str;

                // Extract the temperature and humidity values
                if (std::getline(ss, temp_str, ',') && std::getline(ss, hum_str, ','))
                {
                    // Convert the string values to float
                    float temperature = std::stof(temp_str);  // Convert temperature string to float
                    float humidity = std::stof(hum_str);      // Convert humidity string to float

                    // Insert the received data into the MySQL database
                    sql::PreparedStatement *stmt = con->prepareStatement("INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)");
                    stmt->setDouble(1, temperature);  // Insert temperature as double (floating-point number)
                    stmt->setDouble(2, humidity);     // Insert humidity as double (floating-point number)
                    stmt->executeUpdate();
                    delete stmt;

                    std::cout << "Data inserted into DB: Temperature = " << temperature << ", Humidity = " << humidity << std::endl;
                }
                else
                {
                    std::cerr << "Error parsing data: Invalid format." << std::endl;
                }
            }

            // Clear the buffer at the end of the loop
            std::memset(buffer, '\0', sizeof(buffer));
        }

        // Close the MySQL connection
        delete con;
    }
    catch (sql::SQLException &e)
    {
        std::cerr << "MySQL error: " << e.what() << std::endl;
    }

    close(client_socket);
}

int main()
{
    int server_sock, client_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);

    // Create the server socket
    server_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (server_sock < 0)
    {
        perror("Socket creation failed");
        return -1;
    }

    int optval = 1;
    if (setsockopt(server_sock, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof(optval)) < 0)
    {
        std::cerr << "Setting SO_REUSEADDR failed!" << std::endl;
        close(server_sock);
        return -1;
    }

    // Prepare the server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // Accept connections from any IP
    server_addr.sin_port = htons(PORT);

    // Bind the socket to the address and port
    if (bind(server_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        perror("Bind failed");
        close(server_sock);
        return -1;
    }

    // Listen for incoming connections
    if (listen(server_sock, 5) < 0)
    {
        perror("Listen failed");
        close(server_sock);
        return -1;
    }

    std::cout << "Server is listening on port " << PORT << "..." << std::endl;

    // Accept clients and handle them in separate threads
    while (true)
    {
        client_sock = accept(server_sock, (struct sockaddr *)&client_addr, &client_len);
        if (client_sock < 0)
        {
            perror("Accept failed");
            continue; // Continue accepting other clients
        }

        // create a new thread to handle new clietn connection
        std::thread client_thread(client_handler, client_sock);
        client_thread.detach();
    }

    close(server_sock); // Close the server socket when done
    return 0;
}
//compile command  g++ -o server server.cpp -I/usr/include/cppconn -L/usr/lib -lmysqlcppconn -lpthread