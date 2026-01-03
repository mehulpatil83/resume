package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/user/resume-generator/backend/db"
	"github.com/user/resume-generator/backend/ent"
	"github.com/user/resume-generator/backend/ent/resume"
	"github.com/user/resume-generator/backend/ent/user"
)

type CreateResumeRequest struct {
	UserID  int    `json:"user_id" binding:"required"`
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"` // JSON string
}

func CreateResume(c *gin.Context) {
	var req CreateResumeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a real app, strict JSON validation for Content would go here.

	r, err := db.Client.Resume.
		Create().
		SetUserID(req.UserID).
		SetTitle(req.Title).
		SetContent(req.Content).
		SetStatus("draft").
		Save(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create resume: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": r.ID, "title": r.Title, "status": r.Status})
}

func GetResume(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	r, err := db.Client.Resume.
		Query().
		Where(resume.IDEQ(id)).
		Only(context.Background())

	if err != nil {
		if ent.IsNotFound(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, r)
}

func ListResumes(c *gin.Context) {
    // Ideally filter by UserID from query param or Auth token
    // For now, listing all for simplicity or based on a query param
    
    userIDStr := c.Query("user_id")
    if userIDStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "user_id query parameter required"})
        return
    }
    userID, _ := strconv.Atoi(userIDStr)

    resumes, err := db.Client.Resume.
        Query().
        Where(resume.HasUserWith(user.IDEQ(userID))).
        All(context.Background())
        
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }
    
    c.JSON(http.StatusOK, resumes)
}
