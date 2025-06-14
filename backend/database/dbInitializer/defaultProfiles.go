package dbinitializer

import (
	"graduation-system/crud"
)

type UserJSON struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

/*
func importUsersFromJSON(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	var users []UserJSON
	err = json.Unmarshal(bytes, &users)
	if err != nil {
		return err
	}

	for _, u := range users {
		hashed_password, err := util.HashPassword(u.Password)
		if err != nil {
			log.Printf("Hashing password failed during default user creation: %v", err)
			continue
		}
		user := &crud.User{
			Username:  u.Username,
			Password:  hashed_password,
		}

		crud.CreateUser(user)
	}

	return nil
}
*/

func InitializeDefaultProfiles() {
	if len(crud.GetUsers()) == 0 {
		/*
			err := importUsersFromJSON(advisor_path)
			if err != nil {
				log.Printf("Error users from file %s: %v\n", advisor_path, err)
			}
			err = importUsersFromJSON(department_secretary_path)
			if err != nil {
				log.Printf("Error users from file %s: %v\n", department_secretary_path, err)
			}
			err = importUsersFromJSON(faculty_secretary_path)
			if err != nil {
				log.Printf("Error users from file %s: %v\n", faculty_secretary_path, err)
			}
			err = importUsersFromJSON(student_affairs_path)
			if err != nil {
				log.Printf("Error users from file %s: %v\n", student_affairs_path, err)
			}
			err = importUsersFromJSON(rectorate_path)
			if err != nil {
				log.Printf("Error users from file %s: %v\n", rectorate_path, err)
			}
			err = importUsersFromJSON(students_path)
			if err != nil {
				log.Printf("Error users from file %s: %v\n", students_path, err)
			}
		*/
	}

}
