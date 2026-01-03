import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createResume } from '@/api/client';
import { useToast } from "@/hooks/use-toast";

const resumeSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    summary: z.string().optional(),
    skills: z.string().optional(),
    experience: z.string().optional(), // Keeping it simple text for now
    jobDescription: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

const Builder = () => {
    const { toast } = useToast()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResumeFormValues>({
        resolver: zodResolver(resumeSchema),
    });

    const onSubmit = async (data: ResumeFormValues) => {
        try {
            const result = await createResume(data);
            console.log("Created Resume:", result);
            toast({
                title: "Resume Created!",
                description: "Your resume has been saved as a draft with ID: " + result.id,
            })
        } catch (error) {
            console.error("Failed to create resume:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save resume. Ensure backend is running.",
            })
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Build Your Resume</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                        id="summary"
                        {...register("summary")}
                        placeholder="Briefly describe your career highlights..."
                        className="h-32"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="skills">Skills (Comma separated)</Label>
                    <Input id="skills" {...register("skills")} placeholder="Go, Python, React, System Design" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="experience">Work Experience / Raw Data</Label>
                    <Textarea
                        id="experience"
                        {...register("experience")}
                        placeholder="Paste your past experience or old resume content here..."
                        className="h-48"
                    />
                    <p className="text-sm text-muted-foreground">The AI will parse and format this.</p>
                </div>

                <div className="border-t pt-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">Job Targeting (Optional)</h2>
                    <div className="space-y-2">
                        <Label htmlFor="jd">Job Description</Label>
                        <Textarea
                            id="jd"
                            {...register("jobDescription")}
                            placeholder="Paste the Job Description you are applying for..."
                            className="h-48 border-blue-200"
                        />
                        <p className="text-sm text-muted-foreground">We will tailor your resume to match these requirements.</p>
                    </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6">
                    {isSubmitting ? 'Generating...' : 'Generate Resume'}
                </Button>
            </form>
        </div>
    );
};

export default Builder;
