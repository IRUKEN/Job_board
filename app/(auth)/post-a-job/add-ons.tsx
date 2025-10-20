'use client'

export type AddOnSelection = {
  stick: boolean
  highlight: boolean
}

type AddOnsProps = {
  value: AddOnSelection
  onChange: (value: AddOnSelection) => void
  disabled?: boolean
  isSubmitting?: boolean
}

const toggleClassNames = (
  isActive: boolean,
  disabled?: boolean
) =>
  [
    'w-full text-left py-3 px-4 border rounded-sm transition-colors duration-150 ease-in-out',
    isActive ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200',
    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-500'
  ].join(' ')

export default function AddOns({ value, onChange, disabled, isSubmitting }: AddOnsProps) {
  const { stick, highlight } = value

  const handleStickToggle = () => {
    if (disabled) {
      return
    }

    onChange({
      ...value,
      stick: !stick,
    })
  }

  const handleHighlightToggle = () => {
    if (disabled) {
      return
    }

    onChange({
      ...value,
      highlight: !highlight,
    })
  }

  return (
    <div className="py-6">
      <div className="text-lg font-bold text-gray-800 mb-5">
        <span className="text-indigo-500">3.</span> Select add-ons and pay
      </div>
      <div className="space-y-4">
        <button
          type="button"
          className={toggleClassNames(stick, disabled)}
          onClick={handleStickToggle}
          aria-pressed={stick}
          disabled={disabled}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-800 font-medium mb-1">Stick your post to stay on top (+$79)</div>
              <div className="text-sm text-gray-500 italic">4x more views</div>
            </div>
            <div className="shrink-0 rounded-full border border-gray-200 ml-3">
              {stick ? (
                <svg className="fill-indigo-500" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15h-4v-4a1 1 0 0 0-2 0v4h-4a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2Z" />
                </svg>
              ) : (
                <svg className="fill-teal-500" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="m20.28 12.28-6.292 6.294-2.293-2.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l7-7a1 1 0 1 0-1.414-1.414Z" />
                </svg>
              )}
            </div>
          </div>
        </button>
        <button
          type="button"
          className={toggleClassNames(highlight, disabled)}
          onClick={handleHighlightToggle}
          aria-pressed={highlight}
          disabled={disabled}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-800 font-medium mb-1">Highlight your post in indigo (+$49)</div>
              <div className="text-sm text-gray-500 italic">2x more views</div>
            </div>
            <div className="shrink-0 rounded-full border border-gray-200 ml-3">
              {highlight ? (
                <svg className="fill-indigo-500" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15h-4v-4a1 1 0 0 0-2 0v4h-4a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2Z" />
                </svg>
              ) : (
                <svg className="fill-teal-500" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="m20.28 12.28-6.292 6.294-2.293-2.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l7-7a1 1 0 1 0-1.414-1.414Z" />
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className={`btn w-full text-white bg-indigo-500 hover:bg-indigo-600 shadow-xs ${
            disabled ? 'opacity-70 cursor-not-allowed hover:bg-indigo-500' : ''
          }`}
          disabled={disabled}
        >
          {isSubmitting ? 'Procesando pago…' : 'Pay Now - $349'}
        </button>
      </div>
      <div className="mt-4">
        <div className="text-xs text-gray-500">
          By clicking pay you agree to our{' '}
          <a className="underline" href="#0">
            Terms of Service
          </a>{' '}
          and{' '}
          <a className="underline" href="#0">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  )
}
