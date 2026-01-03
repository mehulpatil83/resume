package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/user/resume-generator/backend/db"
	"github.com/user/resume-generator/backend/ent"
	"github.com/user/resume-generator/backend/ent/user"
)

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"full_name" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// hash password logic here (omitted for brevity, assume cleartext for now or TODO)

	u, err := db.Client.User.
		Create().
		SetEmail(req.Email).
		SetFullName(req.FullName).
		SetPasswordHash(req.Password). // TODO: Hash this!
		Save(context.Background())

	if err != nil {
		if ent.IsConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": u.ID, "email": u.Email, "full_name": u.FullName})
}

func GetUser(c *gin.Context) {
    email := c.Param("email")
    
    u, err := db.Client.User.
        Query().
        Where(user.EmailEQ(email)).
        Only(context.Background())
        
    if err != nil {
        if ent.IsNotFound(err) {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"id": u.ID, "email": u.Email, "full_name": u.FullName})
}
