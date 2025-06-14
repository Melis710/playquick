package dbinitializer

func InitConstraints() {
	DropConstraints()
	/*
		if err := globals.GMSDB.Exec(`
			ALTER TABLE users
			ADD CONSTRAINT fk_users_role
			FOREIGN KEY (role) REFERENCES roles(name)
			ON DELETE CASCADE;
		`).Error; err != nil {
			log.Printf("(Error) : error adding constraint to users table: %v", err)
		}
	*/
}
