package cmd

import (
	"graduation-system/endpoints"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitializeServer(port string) {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // React dev server
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	r.POST("/score/save", endpoints.SaveScore)
	r.GET("/score/players/:game_name", endpoints.GetScore)

	log.Printf("Server running on :%s", port)
	r.Run(":" + port)
}
