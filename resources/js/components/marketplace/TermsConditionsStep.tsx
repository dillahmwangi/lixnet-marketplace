import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TermsConditionsStepProps {
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export default function TermsConditionsStep({
    onSubmit,
    onBack,
    isSubmitting,
}: TermsConditionsStepProps) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const termsContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        const container = termsContainerRef.current;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            if (isAtBottom) {
                setHasScrolledToBottom(true);
            }
        }
    };

    useEffect(() => {
        const container = termsContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <Card className="bg-card-color border border-border-color">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                    <FileText className="w-6 h-6 mr-3 text-brand-blue" />
                    Service Agreement Terms
                </CardTitle>
                <CardDescription>
                    Please read the service agreement carefully and scroll to the bottom to accept
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!hasScrolledToBottom && (
                    <Alert className="bg-yellow-50 border-yellow-300">
                        <AlertDescription className="text-yellow-800">
                            <strong>Please scroll down</strong> to read all terms and conditions before accepting.
                        </AlertDescription>
                    </Alert>
                )}

                <div
                    ref={termsContainerRef}
                    className="h-96 overflow-y-auto border border-gray-300 rounded-lg p-6 bg-gray-50"
                >
                    <div className="prose prose-sm max-w-none text-gray-900">
                        <h2 className="text-xl font-bold text-center mb-4 text-gray-900">
                            SERVICE AGREEMENT FOR INDEPENDENT SALES AGENT
                        </h2>

                        <p className="text-sm text-gray-700 mb-4">
                            This Service Agreement ("Agreement") is made and entered into on this day by and between:
                        </p>

                        <p className="mb-2 text-gray-800">
                            <strong>Lixnet Technologies</strong>, a company duly registered under the laws of Kenya,
                            with its principal office located in Nairobi, Kenya (hereinafter referred to as the "Company"),
                        </p>

                        <p className="mb-4 text-gray-800">
                            <strong>AND</strong>
                        </p>

                        <p className="mb-6 text-gray-800">
                            The applicant (hereinafter referred to as the "Sales Agent").
                        </p>

                        <p className="mb-4 text-gray-800">
                            The Company and the Sales Agent are collectively referred to as the "Parties."
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">1. APPOINTMENT & INDEPENDENT CONTRACTOR STATUS</h3>
                        <p className="mb-4 text-gray-800">
                            The Company hereby appoints the Sales Agent on a non-exclusive basis to market, promote,
                            and sell the Company's software solutions, within the territory of Kenya. The Sales Agent
                            is an independent contractor and not an employee, partner, or agent of the Company for any
                            purpose other than as expressly set forth in this Agreement. The Sales Agent is solely
                            responsible for directing and controlling the means and manner of performing the services
                            under this Agreement.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">2. TERM AND RENEWAL</h3>
                        <p className="mb-4 text-gray-800">
                            This Agreement shall commence on the date of acceptance and shall remain in effect until
                            December 31st, 2025. Thereafter, this Agreement shall automatically renew for successive
                            one (1) year terms (each a "Renewal Term").
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">3. DUTIES AND RESPONSIBILITIES OF THE SALES AGENT</h3>
                        <p className="mb-2 text-gray-800">The Sales Agent shall:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-800">
                            <li>Act in good faith and in the best interests of the Company at all times.</li>
                            <li>Use best efforts to market and secure sales of the Company's software.</li>
                            <li>Provide regular sales reports and feedback to the Company.</li>
                            <li>Maintain confidentiality regarding all Company information and customer data.</li>
                            <li>Comply with all applicable laws and ethical business practices.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">4. DUTIES OF THE COMPANY</h3>
                        <p className="mb-2 text-gray-800">The Company shall:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-800">
                            <li>Provide the Sales Agent with product training, promotional materials, and reasonable support.</li>
                            <li>Offer payment of commissions within 1 business day of confirming receipt of payments from clients.</li>
                            <li>Update the Sales Agent on any product changes, pricing, or policies.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">5. COMMISSION STRUCTURE</h3>
                        <p className="mb-4 text-gray-800">
                            The Sales Agent shall earn a commission as detailed in the commission sheet for the
                            particular calendar year, which shall be made available on the Company's official portal.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">6. EXPENSES</h3>
                        <p className="mb-4 text-gray-800">
                            As an independent contractor, the Sales Agent shall be solely responsible for and shall
                            bear all of their own operational costs, including but not limited to travel, communication,
                            and marketing expenses, unless otherwise expressly agreed in writing by the Company.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">7. CONFIDENTIALITY</h3>
                        <p className="mb-4 text-gray-800">
                            The Sales Agent agrees not to disclose or use any confidential or proprietary information
                            belonging to the Company for any purpose other than the performance of this Agreement, both
                            during and after the termination of this Agreement.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">8. NON-COMPETE</h3>
                        <p className="mb-4 text-gray-800">
                            During the term of this Agreement and for six (6) months after termination, the Sales Agent
                            shall not directly or indirectly engage in the promotion or sale of competing software
                            products within Kenya without the prior written consent of the Company.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">9. TERMINATION</h3>
                        <p className="mb-2 text-gray-800">This Agreement may be terminated:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-800">
                            <li>By either Party with 30 days' written notice;</li>
                            <li>Immediately by the Company for gross misconduct, breach of confidentiality, fraud, or non-performance by the Sales Agent;</li>
                            <li>Automatically if either Party becomes insolvent or unable to perform its obligations.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">10. DISPUTE RESOLUTION</h3>
                        <p className="mb-4 text-gray-800">
                            Any dispute arising from this Agreement shall be resolved amicably through negotiation.
                            If unresolved, disputes shall be referred to arbitration in accordance with the laws of
                            Kenya, and the decision shall be final and binding.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">11. GOVERNING LAW</h3>
                        <p className="mb-4 text-gray-800">
                            This Agreement shall be governed and construed in accordance with the laws of Kenya.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">12. ENTIRE AGREEMENT</h3>
                        <p className="mb-6 text-gray-800">
                            This Agreement constitutes the entire understanding between the Parties and supersedes any
                            prior oral or written agreements relating to the subject matter herein. Any amendment must
                            be made in writing and signed by both Parties.
                        </p>

                        <div className="border-t pt-4 mt-8 mb-4">
                            <p className="text-sm text-gray-700 italic">
                                By accepting these terms, you acknowledge that you have read, understood, and agree to
                                be bound by all terms and conditions outlined in this Service Agreement.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border-color">
                    <div className="flex items-start space-x-3 mb-4">
                        <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                            disabled={!hasScrolledToBottom}
                        />
                        <div className="space-y-1">
                            <Label
                                htmlFor="terms"
                                className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'cursor-pointer'}`}
                            >
                                I have read and accept the Service Agreement terms and conditions *
                            </Label>
                            <p className="text-xs text-gray-500">
                                By checking this box, you confirm that all information provided is accurate and that
                                you are currently enrolled as a student at the specified university.
                            </p>
                        </div>
                    </div>

                    {!hasScrolledToBottom && (
                        <p className="text-sm text-amber-600 mb-4">
                            You must scroll to the bottom of the terms to enable acceptance.
                        </p>
                    )}
                </div>

                <div className="flex justify-between pt-6">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="px-8"
                        disabled={isSubmitting}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || !termsAccepted}
                        className="bg-green-600 hover:bg-green-700 px-8"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Submitting...
                            </div>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Submit Application
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
