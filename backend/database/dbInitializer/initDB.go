package dbinitializer

import (
	"graduation-system/crud"
	"graduation-system/globals"
	"log"
)

func CreateTables() {
	if globals.GMSDB == nil {
		log.Fatal("Database is not initialized")
	}

	if err := globals.GMSDB.AutoMigrate(&crud.User{}); err != nil {
		log.Fatalf("(Error) : error creating tables : %v", err)
	}
}
