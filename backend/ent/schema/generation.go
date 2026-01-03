package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Generation holds the schema definition for the Generation entity.
type Generation struct {
	ent.Schema
}

// Fields of the Generation.
func (Generation) Fields() []ent.Field {
	return []ent.Field{
		field.String("job_description"),
		field.String("status").Default("pending"),
		field.String("result").Optional(),
	}
}

// Edges of the Generation.
func (Generation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("resume", Resume.Type).Ref("generations").Unique().Required(),
	}
}
