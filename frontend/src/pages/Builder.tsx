import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createResume, uploadResume, getAtsScore, getGapAnalysis, getLinkedinOptimizer, getInterviewPrep } from '@/api/client';
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, CheckCircle2, Bot, Briefcase, GraduationCap, Linkedin, Target } from 'lucide-react';

const resumeSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    about: z.string().optional(),
    summary: z.string().optional(),
    skills: z.string().optional(),
    experience: z.string().optional(),
    jobDescription: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

const Builder = () => {
    const { toast } = useToast()
    const { register, handleSubmit, setValue, getValues, formState: { errors, isSubmitting } } = useForm<ResumeFormValues>({
        resolver: zodResolver(resumeSchema),
    });

    const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showKeywordsModal, setShowKeywordsModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [generatedResumeData, setGeneratedResumeData] = useState<ResumeFormValues | null>(null);

    // AI Agents State
    const [isAgentLoading, setIsAgentLoading] = useState<string | null>(null);
    const [agentResult, setAgentResult] = useState<{ title: string; content: string } | null>(null);

    const getResumeContext = () => {
        const vals = getValues();
        return `Name: ${vals.fullName || ''}\nAbout: ${vals.about || ''}\nSummary: ${vals.summary || ''}\nSkills: ${vals.skills || ''}\nExperience: ${vals.experience || ''}`;
    };

    const handleAgentCall = async (agentName: string, callFn: () => Promise<string>) => {
        setIsAgentLoading(agentName);
        try {
            const result = await callFn();
            setAgentResult({ title: agentName, content: result });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Agent Error",
                description: `Failed to run ${agentName}. Ensure AI service is running.`,
            });
        } finally {
            setIsAgentLoading(null);
        }
    };

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
                setShowKeywordsModal(true);
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
            setGeneratedResumeData(data);
            setShowResumeModal(true);
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

                                {/* About Section */}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                                        About Me
                                    </h2>
                                    <Textarea
                                        id="about"
                                        {...register("about")}
                                        placeholder="Briefly introduce yourself, your passions, and what drives you..."
                                        className="min-h-[100px] resize-y border-slate-200 focus:border-blue-500 transition-colors p-4 leading-relaxed"
                                    />
                                </div>

                                {/* Summary Section */}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
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
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
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
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span>
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

                            {/* AI Agents Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-purple-500" />
                                    AI Career Coaches
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Use our specialized AI agents, powered by industry-leading models, to perfect your application strategy.
                                </p>

                                <div className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto py-3 px-4 border-slate-200 hover:border-purple-300 hover:bg-purple-50"
                                        disabled={!!isAgentLoading}
                                        onClick={() => handleAgentCall("ATS Scoring Agent (GPT-4o)", () => getAtsScore(getResumeContext(), getValues("jobDescription") || ""))}
                                    >
                                        <Target className="h-5 w-5 mr-3 text-purple-600" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">ATS Scoring</span>
                                            <span className="text-xs text-slate-500">Rate resume against JD</span>
                                        </div>
                                        {isAgentLoading === "ATS Scoring Agent (GPT-4o)" && <Loader2 className="ml-auto h-4 w-4 animate-spin text-purple-600" />}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto py-3 px-4 border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                                        disabled={!!isAgentLoading}
                                        onClick={() => handleAgentCall("Gap Analysis Agent (Claude)", () => getGapAnalysis(getResumeContext(), getValues("jobDescription") || ""))}
                                    >
                                        <Briefcase className="h-5 w-5 mr-3 text-orange-600" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">Gap Analysis</span>
                                            <span className="text-xs text-slate-500">Find missing skills vs JD</span>
                                        </div>
                                        {isAgentLoading === "Gap Analysis Agent (Claude)" && <Loader2 className="ml-auto h-4 w-4 animate-spin text-orange-600" />}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto py-3 px-4 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                        disabled={!!isAgentLoading}
                                        onClick={() => handleAgentCall("LinkedIn Optimizer (Gemini)", () => getLinkedinOptimizer(getResumeContext()))}
                                    >
                                        <Linkedin className="h-5 w-5 mr-3 text-blue-600" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">LinkedIn Optimizer</span>
                                            <span className="text-xs text-slate-500">Enhance your profile</span>
                                        </div>
                                        {isAgentLoading === "LinkedIn Optimizer (Gemini)" && <Loader2 className="ml-auto h-4 w-4 animate-spin text-blue-600" />}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto py-3 px-4 border-slate-200 hover:border-green-300 hover:bg-green-50"
                                        disabled={!!isAgentLoading}
                                        onClick={() => handleAgentCall("Interview Prep Agent (GPT-4 Turbo)", () => getInterviewPrep(getResumeContext(), getValues("jobDescription") || ""))}
                                    >
                                        <GraduationCap className="h-5 w-5 mr-3 text-green-600" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">Interview Prep</span>
                                            <span className="text-xs text-slate-500">Generate Q&A for the role</span>
                                        </div>
                                        {isAgentLoading === "Interview Prep Agent (GPT-4 Turbo)" && <Loader2 className="ml-auto h-4 w-4 animate-spin text-green-600" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Extracted Keywords Modal */}
            {showKeywordsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-500">✨</span> Extracted Skills
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            We used AI to extract the following key skills from your resume. These have been automatically added to your profile!
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6 max-h-[60vh] overflow-y-auto p-1">
                            {extractedKeywords.map((kw, idx) => (
                                <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700 mt-4">
                            <Button onClick={() => setShowKeywordsModal(false)} className="px-6 shadow-md shadow-blue-500/20">
                                Awesome
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generated Resume Modal */}
            {showResumeModal && generatedResumeData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="text-blue-600">📄</span> Your Generated Resume
                            </h3>
                            <button onClick={() => setShowResumeModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                ✕
                            </button>
                        </div>

                        {/* Body - Resume Preview */}
                        <div className="p-8 overflow-y-auto bg-white dark:bg-slate-900 flex-1 user-select-all font-sans">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-2">{generatedResumeData.fullName}</h1>
                                <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">{generatedResumeData.email}</p>
                            </div>

                            {generatedResumeData.about && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 uppercase tracking-widest">About</h2>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed text-[15px]">
                                        {generatedResumeData.about}
                                    </p>
                                </div>
                            )}

                            {generatedResumeData.summary && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 uppercase tracking-widest">Summary</h2>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed text-[15px]">
                                        {generatedResumeData.summary}
                                    </p>
                                </div>
                            )}

                            {generatedResumeData.skills && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 uppercase tracking-widest">Core Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedResumeData.skills.split(',').map((skill, i) => skill.trim() && (
                                            <span key={i} className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-md text-sm font-medium border border-slate-200 dark:border-slate-700">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {generatedResumeData.experience && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 uppercase tracking-widest">Experience</h2>
                                    <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed text-[15px] pl-2 border-l-2 border-slate-100 dark:border-slate-800">
                                        {generatedResumeData.experience}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <Button variant="outline" onClick={() => setShowResumeModal(false)} className="border-slate-200">Close</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 px-6">Looking Good!</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Agent Result Modal */}
            {agentResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bot className="text-purple-600 h-5 w-5" />
                                {agentResult.title}
                            </h3>
                            <button onClick={() => setAgentResult(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto w-full text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                            {agentResult.content}
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <Button onClick={() => setAgentResult(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Builder;
