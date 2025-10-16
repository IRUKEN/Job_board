'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'

import AddOns, { AddOnSelection } from './add-ons'
import UploadImage from '@/public/images/upload.jpg'
import { GraphQLClientError, getGraphQLClient } from '@/lib/graphql-client'

const CREATE_JOB_POSTING_MUTATION = /* GraphQL */ `
  mutation CreateJobPosting($input: CreateJobPostingInput!) {
    createJobPosting(input: $input) {
      id
      title
      status
    }
  }
`

const defaultAddOns: AddOnSelection = {
  stick: false,
  highlight: true,
}

type CreateJobPostingResponse = {
  createJobPosting: {
    id: string
    title?: string | null
    status?: string | null
  }
}

type JobPostingInput = {
  companyName: string
  contactEmail: string
  title: string
  role: string
  commitment: string
  description: string
  salary?: string | null
  addOns: AddOnSelection
}

export default function PostJobForm() {
  const [companyName, setCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [positionName, setPositionName] = useState('')
  const [role, setRole] = useState('Programming')
  const [commitment, setCommitment] = useState('Full-time')
  const [description, setDescription] = useState('')
  const [salary, setSalary] = useState('')
  const [addOns, setAddOns] = useState<AddOnSelection>(defaultAddOns)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const resetForm = () => {
    setCompanyName('')
    setContactEmail('')
    setPositionName('')
    setRole('Programming')
    setCommitment('Full-time')
    setDescription('')
    setSalary('')
    setAddOns(defaultAddOns)
  }

  const buildInput = (): JobPostingInput => ({
    companyName: companyName.trim(),
    contactEmail: contactEmail.trim(),
    title: positionName.trim(),
    role,
    commitment,
    description,
    salary: salary.trim() ? salary.trim() : null,
    addOns,
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus(null)

    const payload = buildInput()

    if (!payload.companyName || !payload.contactEmail || !payload.title || !payload.description) {
      setError('Completa los campos obligatorios antes de enviar la vacante.')
      return
    }

    setIsSubmitting(true)

    try {
      const client = getGraphQLClient()
      const response = await client.request<CreateJobPostingResponse>({
        query: CREATE_JOB_POSTING_MUTATION,
        variables: {
          input: payload,
        },
      })

      const createdJob = response.createJobPosting
      const confirmationDetails = createdJob?.id
        ? `Vacante enviada correctamente. ID de seguimiento: ${createdJob.id}.`
        : 'Vacante enviada correctamente al backend GraphQL.'

      setStatus(confirmationDetails)
      resetForm()
    } catch (err) {
      if (err instanceof GraphQLClientError) {
        const details = err.details?.[0]?.message ?? err.message
        setError(details || 'El backend GraphQL respondió con un error inesperado.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error desconocido al enviar la vacante.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold font-inter mb-2">Post a job on JobBoard</h1>
        <div className="text-gray-500">
          Encuentra el mejor talento conectándote a nuestro backend de NestJS mediante GraphQL.
        </div>
      </div>

      {error ? (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-600 rounded">{error}</div>
      ) : null}

      {status ? (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded">{status}</div>
      ) : null}

      <form className="mb-12" onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting} className="contents">
          <div className="divide-y divide-gray-200 -my-6">
            <div className="py-6">
              <div className="text-lg font-bold text-gray-800 mb-5">
                <span className="text-indigo-500">1.</span> Your company
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="companyName">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    className="form-input w-full"
                    type="text"
                    required
                    placeholder="E.g., Acme Inc."
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="contactEmail">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contactEmail"
                    className="form-input w-full"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="companyLogo">
                    Company Logo <span className="text-gray-500">(optional)</span>
                  </label>
                  <div className="flex items-center">
                    <div className="shrink-0 mr-4">
                      <Image className="object-cover w-16 h-16 rounded-full border border-gray-200" src={UploadImage} alt="Upload" />
                    </div>
                    <div>
                      <input
                        id="companyLogo"
                        type="file"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition duration-150 ease-in-out cursor-pointer"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-6">
              <div className="text-lg font-bold text-gray-800 mb-5">
                <span className="text-indigo-500">2.</span> The role
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="positionName">
                    Position Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="positionName"
                    className="form-input w-full"
                    type="text"
                    required
                    placeholder="E.g., Senior Software Engineer"
                    value={positionName}
                    onChange={(event) => setPositionName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 font-medium mb-1" htmlFor="role">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="role"
                    className="form-select text-sm py-2 w-full"
                    required
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Management / Finance">Management / Finance</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Sales / Marketing">Sales / Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-800 font-medium mb-1" htmlFor="commitment">
                    Commitment <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="commitment"
                    className="form-select text-sm py-2 w-full"
                    required
                    value={commitment}
                    onChange={(event) => setCommitment(event.target.value)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract / Freelance">Contract / Freelance</option>
                    <option value="Co-founder">Co-founder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-800 font-medium mb-1" htmlFor="description">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    className="form-textarea text-sm py-2 w-full"
                    rows={4}
                    required
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="salary">
                    Salary <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="salary"
                    className="form-input w-full"
                    type="text"
                    value={salary}
                    onChange={(event) => setSalary(event.target.value)}
                  />
                  <div className="text-xs text-gray-500 italic mt-2">Example: “$100,000 - $170,000 USD”</div>
                </div>
              </div>
            </div>

            <AddOns value={addOns} onChange={setAddOns} disabled={isSubmitting} isSubmitting={isSubmitting} />
          </div>
        </fieldset>
      </form>
    </>
  )
}
