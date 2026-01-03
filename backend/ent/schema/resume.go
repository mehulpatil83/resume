package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Resume holds the schema definition for the Resume entity.
type Resume struct {
	ent.Schema
}

// Fields of the Resume.
func (Resume) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.String("content").Default("{}"), // Using string to store JSON for now
		field.String("status").Default("draft"),
	}
}

// Edges of the Resume.
func (Resume) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("resumes").Unique().Required(),
		edge.To("generations", Generation.Type),
	}
}
