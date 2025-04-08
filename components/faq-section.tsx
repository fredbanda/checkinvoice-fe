/* eslint-disable  @typescript-eslint/no-explicit-any */

import React, { useState } from "react";

const faqs = [
  {
    question: "How do I create a check?",
    answer:
      "To create a check please click on the 'Add Check' button on the check management page. You will be asked to take an image of your check which will activate your camera. Make sure you choose a company from the dropdown menu and enter the check number. Once you have captured the image, click on the 'Save Check' button to save your check.",
  },
  {
    question: "How do I link invoices to a check?",
    answer:
      "To link invoices to a check, go to the check management page and click on the 'Link Invoices' button. Select the invoices you want to link to the check and click on the 'Save Links' button. The invoices will now be linked to the check.",
  },
  {
    question: "Can I delete a check?",
    answer:
      "For security reasons, you cannot delete a check once it has been created. However, you can edit a check and remove the image. This will remove the check from the system and make it inaccessible.",
  },
  {
    question: "how to create invoices and companies ?",
    answer:
      "To create an invoice, go to the invoice management page and click on the 'Add Invoice' button. You will be asked to enter the invoice number. Once you have entered the details, click on the 'Save Invoice' button to save your invoice.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center gap-x-16 gap-y-5 xl:gap-28 lg:flex-row lg:justify-between max-lg:max-w-2xl mx-auto max-w-full">
          <div className="w-full lg:w-1/2">
            <img
              src="https://pagedone.io/asset/uploads/1696230182.png"
              alt="FAQ tailwind section"
              className="w-full rounded-xl object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <div className="lg:max-w-xl">
              <div className="mb-6 lg:mb-16">
                <h6 className="text-lg text-center font-medium text-indigo-600 mb-2 lg:text-left">
                  FAQs
                </h6>
                <h2 className="text-4xl text-center font-bold text-gray-900 leading-[3.25rem] mb-5 lg:text-left">
                  Looking for answers?
                </h2>
              </div>

              <div className="accordion-group">
                {faqs.map((item, index) => (
                  <div
                    key={index}
                    className="accordion py-8 border-b border-solid border-gray-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(index)}
                      className={`accordion-toggle group inline-flex items-center justify-between w-full text-xl font-normal leading-8 text-gray-600 transition duration-500 hover:text-indigo-600 ${
                        openIndex === index ? "text-indigo-600 font-medium" : ""
                      }`}
                      aria-controls={`faq-panel-${index}`}
                      aria-expanded={openIndex === index}
                    >
                      <h5>{item.question}</h5>
                      <svg
                        className={`transition duration-500 transform ${
                          openIndex === index ? "rotate-180 text-indigo-600" : "text-gray-900"
                        } group-hover:text-indigo-600`}
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.5 8.25L12.4142 12.3358C11.7475 13.0025 11.4142 13.3358 11 13.3358C10.5858 13.3358 10.2525 13.0025 9.58579 12.3358L5.5 8.25"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div
                      id={`faq-panel-${index}`}
                      className="accordion-content w-full px-0 overflow-hidden pr-4 transition-all duration-500"
                      style={{
                        maxHeight: openIndex === index ? "200px" : "0",
                        opacity: openIndex === index ? 1 : 0,
                      }}
                    >
                      <p className="text-base text-gray-500 font-normal mt-4">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

