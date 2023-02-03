import Link from 'next/link'
import React, { useState } from 'react'
import { IconExternalLink, IconX, Input } from 'ui'
import extensions from '../data/extensions.json'

type extension = {
  name: string
  schema: string | null
  default_version: string
  installed_version: string | null
  comment: string
  tags: string[]
  link?: string
}

function getUniqueTags(json: extension[]) {
  const tags = []
  for (const item of json) {
    tags.push(...item.tags)
  }
  return [...new Set(tags)]
}

export default function Extensions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState([])

  const tags = getUniqueTags(extensions)

  function handleChecked(tag) {
    if (filters.includes(tag)) {
      setFilters(filters.filter((x) => x !== tag))
    } else {
      setFilters([...filters, tag])
    }
  }

  return (
    <>
      <div className="mb-8 grid">
        <label className="mb-2 text-xs text-scale-1100">Search extensions</label>
        <Input
          type="text"
          placeholder="Extension name"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="lg:grid lg:grid-cols-12">
        <div className="col-span-3 not-prose">
          <div className="lg:sticky top-24">
            <h3 className="text-sm text-scale-1100">Filter</h3>
            <ul className="mt-3 flex flex-wrap lg:grid gap-2 grow">
              {tags.map((tag) => (
                <li>
                  <label
                    htmlFor={tag}
                    className={`text-sm text-scale-900 py-0.5 px-2 capitalize inline-block rounded-lg hover:bg-slate-400  hover:border-slate-400 cursor-pointer border ${
                      filters.includes(tag) ? 'bg-slate-300 ' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="sr-only"
                        id={tag}
                        name={tag}
                        value={tag}
                        onChange={() => handleChecked(tag)}
                        checked={filters.includes(tag)}
                      />
                      {tag}
                      <span>{filters.includes(tag) && <IconX size={12} />}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2">
              <button
                type="reset"
                className="text-xs hover:underline"
                onClick={() => setFilters([])}
              >
                Reset
              </button>
            </p>
          </div>
        </div>

        <div className="col-span-9 mt-4 lg:mt-0">
          <div className="grid gap-4">
            {extensions
              .filter((x) => x.name.indexOf(searchTerm) >= 0)
              .filter((x) =>
                filters.length === 0 ? x : x.tags.some((item) => filters.includes(item))
              )
              .map((extension) => (
                <div className="my-2 px-2 relative" key={extension.name}>
                  <div className="border rounded-sm p-4">
                    <h3 className="m-0">
                      <code className="text-sm">{extension.name}</code>
                    </h3>
                    <p className=" mt-4">
                      {extension.comment.charAt(0).toUpperCase() + extension.comment.slice(1)}
                    </p>
                    {extension.link && (
                      <Link href={extension.link}>
                        <a
                          target="_blank"
                          className="absolute top-2 right-4 hover:bg-slate-400 transition-colors p-2 rounded-md"
                        >
                          <span>
                            <IconExternalLink size={14} className="" />
                          </span>
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
