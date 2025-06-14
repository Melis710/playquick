package crud

import (
	"graduation-system/globals"
	"log"
)

type User struct {
	ID       int    `gorm:"column:id;type:int(11);primaryKey;autoIncrement" json:"id"`
	Username string `gorm:"column:username;type:varchar(255);not null" json:"username"`
	Password string `gorm:"column:password;type:char(60);not null" json:"password"`
	Score    int    `gorm:"column:score;type:int(11);not null" json:"score"`
	GameName string `gorm:"column:game_name;type:varchar(255);not null" json:"game_name"`
}

func (User) TableName() string {
	return "users"
}

// Get all users
func GetUsers() []User {
	var users []User
	if err := globals.GMSDB.Find(&users).Error; err != nil {
		log.Printf("(Error) : error getting users : %v", err)
	}
	return users
}

func GetUsersByGameName(game_name string) []User {
	var users []User
	if err := globals.GMSDB.Find(&users, "game_name = ?", game_name).Error; err != nil {
		log.Printf("(Error) : error getting users : %v", err)
	}
	return users
}

// Get user by ID
func GetUserByID(id int) User {
	var user User
	if err := globals.GMSDB.First(&user, "id = ?", id).Error; err != nil {
		log.Printf("(Error) : error getting user : %v", err)
	}
	return user
}

// Get user by Username
func GetUserByUsernameAndGameName(username string, game_name string) User {
	var user User
	if err := globals.GMSDB.First(&user, "username = ? and game_name = ?", username, game_name).Error; err != nil {
		log.Printf("(Error) : error getting user : %v", err)
	}
	return user
}

// Create user
func CreateUser(user *User) error {
	if err := globals.GMSDB.Create(user).Error; err != nil {
		log.Printf("(Error) : error creating user : %v", err)
		return err
	}
	return nil
}

// Update user
func UpdateUser(user User) error {
	if err := globals.GMSDB.Save(&user).Error; err != nil {
		log.Printf("(Error) : error updating user : %v", err)
		return err
	}
	return nil
}

// Delete user
func DeleteUserByID(id int) error {
	if err := globals.GMSDB.Delete(&User{}, id).Error; err != nil {
		log.Printf("(Error) : error deleting user : %v", err)
		return err
	}
	return nil
}
