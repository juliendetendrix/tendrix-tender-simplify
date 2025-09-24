import { useState, useEffect } from 'react'

interface CompanyData {
  company_name?: string
}

export const useCompanyData = () => {
  const [companyName, setCompanyName] = useState<string>('')

  useEffect(() => {
    // Try to get company name from beta questionnaire
    const betaData = localStorage.getItem('beta_questionnaire_draft')
    if (betaData) {
      try {
        const parsed = JSON.parse(betaData)
        if (parsed.formData?.company_name) {
          setCompanyName(parsed.formData.company_name)
          return
        }
      } catch (error) {
        console.error('Error parsing beta questionnaire data:', error)
      }
    }

    // Try to get company name from PME questionnaire
    const pmeData = localStorage.getItem('pme-questionnaire-draft')
    if (pmeData) {
      try {
        const parsed = JSON.parse(pmeData)
        if (parsed.company_name) {
          setCompanyName(parsed.company_name)
          return
        }
      } catch (error) {
        console.error('Error parsing PME questionnaire data:', error)
      }
    }

    // Default if no company name found
    setCompanyName('')
  }, [])

  return { companyName }
}