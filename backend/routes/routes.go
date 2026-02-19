package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/user/resume-generator/backend/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		userGroup := api.Group("/users")
		{
			userGroup.POST("/", handlers.CreateUser)
			userGroup.GET("/:email", handlers.GetUser)
		}

		resumeGroup := api.Group("/resumes")
		{
			resumeGroup.POST("/", handlers.CreateResume)
			resumeGroup.POST("/upload", handlers.UploadResume)
			resumeGroup.GET("/:id", handlers.GetResume)
			resumeGroup.GET("/", handlers.ListResumes)
		}
	}
}
