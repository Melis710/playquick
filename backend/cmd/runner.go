package cmd

import (
	"graduation-system/database/constructor"
	dbinitializer "graduation-system/database/dbInitializer"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func Run() {
	log.Println("Starting server...")

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	/*
		// Read environment variables
		serverPort := os.Getenv("SERVER_PORT")
	*/
	// Read database environment variables
	dbConfig := constructor.DBConnectionConfig{
		Username: os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASS"),
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		DbName:   os.Getenv("DB_NAME"),
	}

	// Initialize database
	err = constructor.InitDB(dbConfig)
	if err != nil {
		log.Fatal("Error initializing database: ", err)
	}

	// Initialize log file
	initLogFile("logs/server.log")

	// Create tables
	dbinitializer.CreateTables()

	// Initialize default profiles
	dbinitializer.InitializeDefaultProfiles()

	InitializeServer(os.Getenv("SERVER_PORT"))

}

func initLogFile(logFilePath string) {
	LogFile, err := os.OpenFile(logFilePath, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("(Error) : error opening the log file : %v", err)
	}
	log.SetOutput(LogFile)
	log.Printf("Log output is set to %s", logFilePath)
}
