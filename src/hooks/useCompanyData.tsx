import { useState, useEffect } from 'react'

interface CompanyData {
  company_name?: string
}

export const useCompanyData = () => {
  const [companyName, setCompanyName] = useState<string>('')

  const loadCompanyName = () => {
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
  }

  useEffect(() => {
    loadCompanyName()
    
    // Listen for storage changes to update company name when questionnaire is completed
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'beta_questionnaire_draft' || e.key === 'pme-questionnaire-draft') {
        loadCompanyName()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for focus events in case localStorage was updated in the same tab
    const handleFocus = () => {
      loadCompanyName()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return { companyName }
}