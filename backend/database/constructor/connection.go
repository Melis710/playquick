package constructor

import (
	"fmt"
	"graduation-system/globals"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type DBConnectionConfig struct {
	Username string
	Password string
	Host     string
	Port     string
	DbName   string
}

func InitDB(dbConf DBConnectionConfig) error {
	// Create database if not exists
	if err := CreateDatabaseGMSIfNotExists(dbConf); err != nil {
		return err
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbConf.Username,
		dbConf.Password,
		dbConf.Host,
		dbConf.Port,
		dbConf.DbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("error while connecting to the database: %v", err)
	}

	// Connection pool settings
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("error while getting database connection pool: %v", err)
	}

	// Connection pool settings
	sqlDB.SetMaxIdleConns(10)      // Maximum number of idle connections
	sqlDB.SetMaxOpenConns(100)     // Maximum number of open connections
	sqlDB.SetConnMaxLifetime(3600) // Maximum lifetime of connections (seconds)

	fmt.Println("Successfully connected to the database!")
	globals.GMSDB = db
	return nil
}

func CreateDatabaseGMSIfNotExists(dbConf DBConnectionConfig) error {
	// open connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/",
		dbConf.Username,
		dbConf.Password,
		dbConf.Host,
		dbConf.Port)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("error while connecting to the database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("error while getting database connection pool: %v", err)
	}

	defer sqlDB.Close()

	// Clear Database
	err = db.Exec("DROP DATABASE IF EXISTS " + dbConf.DbName + ";").Error
	if err != nil {
		return fmt.Errorf("error while clearing database: %v", err)
	}

	err = db.Exec("CREATE DATABASE IF NOT EXISTS " + dbConf.DbName + " DEFAULT CHARACTER SET = 'utf8mb4' DEFAULT COLLATE 'utf8mb4_unicode_ci';").Error
	if err != nil {
		return fmt.Errorf("error while creating database: %v", err)
	}

	fmt.Println("Successfully created/exists database " + dbConf.DbName)
	return nil
}
