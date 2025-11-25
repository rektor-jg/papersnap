
import React, { useState } from 'react';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Starter",
      description: "For individuals just getting started.",
      price: 0,
      features: [
        "5 Documents / Month",
        "Basic Data Extraction",
        "1 GB Storage",
        "Standard Support",
        "Export to CSV"
      ],
      notIncluded: [
        "AI Chat Assistant",
        "Unlimited Folders",
        "Multiple Users"
      ],
      cta: "Current Plan",
      current: true,
      popular: false
    },
    {
      name: "Professional",
      description: "Perfect for freelancers and contractors.",
      price: billingCycle === 'monthly' ? 12 : 10,
      features: [
        "100 Documents / Month",
        "Advanced AI Extraction",
        "Unlimited Storage",
        "Priority Email Support",
        "AI Chat Assistant",
        "Unlimited Folders",
        "Export to PDF & CSV"
      ],
      notIncluded: [
        "Multiple Users",
        "API Access"
      ],
      cta: "Upgrade to Pro",
      current: false,
      popular: true
    },
    {
      name: "Business",
      description: "For small teams and growing businesses.",
      price: billingCycle === 'monthly' ? 49 : 39,
      features: [
        "Unlimited Documents",
        "Highest Accuracy OCR",
        "Unlimited Storage",
        "24/7 Priority Support",
        "AI Chat Assistant",
        "Team Collaboration (3 Users)",
        "API Access"
      ],
      notIncluded: [],
      cta: "Contact Sales",
      current: false,
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-blue-600 font-bold tracking-wide uppercase text-sm">Simple Pricing</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">Choose the plan that fits your workflow</h2>
        <p className="text-lg text-gray-500">
          Start for free, upgrade when you need more power. No hidden fees.
        </p>

        {/* Toggle */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-blue-600"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly <span className="text-green-600 font-bold ml-1">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative rounded-2xl bg-white p-8 border flex flex-col ${
              plan.popular 
                ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-50 shadow-xl scale-105 z-10' 
                : 'border-gray-200 shadow-sm hover:shadow-md transition-shadow'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{plan.description}</p>
            </div>

            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>

            <div className="flex-1">
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, idx) => (
                  <li key={`not-${idx}`} className="flex items-start opacity-50">
                    <svg className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={plan.current}
              className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                plan.current
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ / Trust */}
      <div className="mt-20 border-t border-gray-200 pt-10">
         <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
            <div>
               <h4 className="font-bold text-gray-900 mb-2">Can I switch plans later?</h4>
               <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade at any time. If you upgrade, the prorated amount will be charged immediately.</p>
            </div>
            <div>
               <h4 className="font-bold text-gray-900 mb-2">Is my data secure?</h4>
               <p className="text-sm text-gray-600">Absolutely. We use enterprise-grade encryption (AES-256) for all stored documents and strictly follow GDPR compliance.</p>
            </div>
            <div>
               <h4 className="font-bold text-gray-900 mb-2">What happens if I exceed my limit?</h4>
               <p className="text-sm text-gray-600">We'll notify you when you're close. You can either wait for the next cycle or upgrade to the next tier instantly.</p>
            </div>
            <div>
               <h4 className="font-bold text-gray-900 mb-2">Do you offer discounts for non-profits?</h4>
               <p className="text-sm text-gray-600">Yes! Contact our sales team with proof of status and we'll set you up with a 50% discount on all plans.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
