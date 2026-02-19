import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createResume, uploadResume } from '@/api/client';
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

const resumeSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    summary: z.string().optional(),
    skills: z.string().optional(),
    experience: z.string().optional(),
    jobDescription: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

const Builder = () => {
    const { toast } = useToast()
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ResumeFormValues>({
        resolver: zodResolver(resumeSchema),
    });

    const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadSuccess(false);
        try {
            const data = await uploadResume(file);
            console.log("Extracted Data:", data);

            if (data.keywords && Array.isArray(data.keywords)) {
                setExtractedKeywords(data.keywords);
                setValue("skills", data.keywords.join(", "));
                setUploadSuccess(true);
                toast({
                    title: "Resume Analyzed Successfully",
                    description: `We extracted ${data.keywords.length} key skills from your document.`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not process the resume PDF.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: ResumeFormValues) => {
        try {
            const result = await createResume(data);
            console.log("Created Resume:", result);
            toast({
                title: "Resume Created!",
                description: "Your resume has been saved as a draft.",
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Resume Builder
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                        Upload your existing resume or start from scratch. We'll help you target the perfect job.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Input Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 space-y-8 border border-slate-100 dark:border-slate-700">

                                {/* Personal Info Section */}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                {...register("fullName")}
                                                placeholder="e.g. Jane Doe"
                                                className="h-12 border-slate-200 focus:border-blue-500 transition-colors"
                                            />
                                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register("email")}
                                                placeholder="e.g. jane@example.com"
                                                className="h-12 border-slate-200 focus:border-blue-500 transition-colors"
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Section */}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                                        Professional Summary
                                    </h2>
                                    <Textarea
                                        id="summary"
                                        {...register("summary")}
                                        placeholder="Briefly describe your career highlights, years of experience, and key achievements..."
                                        className="min-h-[120px] resize-y border-slate-200 focus:border-blue-500 transition-colors p-4 leading-relaxed"
                                    />
                                </div>

                                {/* Skills Section */}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                                        Skills & Technologies
                                    </h2>
                                    <div className="space-y-4">
                                        <Input
                                            id="skills"
                                            {...register("skills")}
                                            placeholder="e.g. React, TypeScript, Node.js, AWS (comma separated)"
                                            className="h-12 border-slate-200 focus:border-blue-500 transition-colors"
                                        />
                                        {extractedKeywords.length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="text-xs font-semibold text-slate-500 w-full mb-1">AI Extracted Suggestions:</span>
                                                {extractedKeywords.map((kw, idx) => (
                                                    <span key={idx} className="bg-white text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-100 shadow-sm font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Experience Section */}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                                        Experience
                                    </h2>
                                    <Textarea
                                        id="experience"
                                        {...register("experience")}
                                        placeholder="Copy and paste your work history here. Our AI will format it professionally."
                                        className="min-h-[200px] border-slate-200 focus:border-blue-500 transition-colors p-4 font-mono text-sm"
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <Button type="submit" disabled={isSubmitting} size="lg" className="w-full text-lg h-14 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Generating Resume...
                                            </>
                                        ) : (
                                            'Generate Professional Resume'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: AI Helpers */}
                        <div className="space-y-8">
                            {/* Target Job Card */}
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🎯</span> Target Job
                                </h3>
                                <p className="text-indigo-100 text-sm mb-4">
                                    Paste the job description you're applying for. We'll tailor your resume keywords to match it perfectly.
                                </p>
                                <Textarea
                                    {...register("jobDescription")}
                                    placeholder="Paste Job Description here..."
                                    className="bg-white/10 border-white/20 placeholder:text-indigo-200 text-white min-h-[200px] focus:ring-0 focus:border-white/40 mb-4"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-semibold"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : "Generate with this JD"}
                                </Button>
                            </div>

                            {/* Upload Resume Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Smart Import
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Upload your existing PDF resume to auto-fill skills and extraction.
                                </p>

                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <Label
                                        htmlFor="resume-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isUploading
                                            ? 'border-blue-300 bg-blue-50'
                                            : uploadSuccess
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center text-blue-600">
                                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                                <span className="text-sm font-medium">Analyzing PDF...</span>
                                            </div>
                                        ) : uploadSuccess ? (
                                            <div className="flex flex-col items-center text-green-600">
                                                <CheckCircle2 className="h-8 w-8 mb-2" />
                                                <span className="text-sm font-medium">Extraction Complete!</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-500 group-hover:text-blue-500">
                                                <UploadCloud className="h-8 w-8 mb-2" />
                                                <span className="text-sm font-medium">Click to Upload PDF</span>
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Builder;
