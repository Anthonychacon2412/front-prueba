import { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { apiGetSearchResult } from '@/services/CommonService'
import useThemeClass from '@/utils/hooks/useThemeClass'
import navigationIcon from '@/configs/navigation-icon.config'
import debounce from 'lodash/debounce'
import { HiOutlineSearch, HiChevronRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import Highlighter from 'react-highlight-words'

type SearchData = {
    title: string
    url: string
    icon: string
    category: string
    categoryTitle: string
}

type SearchResult = {
    title: string
    data: SearchData[]
}

const recommendedSearch: SearchResult[] = [
    {
        title: 'Recommended',
        data: [
            {
                title: 'Documentation',
                url: '/docs/documentation/introduction',
                icon: 'documentation',
                category: 'Docs',
                categoryTitle: 'Docs',
            },
            {
                title: 'Changelog',
                url: '/docs/changelog',
                icon: 'changeLog',
                category: 'Docs',
                categoryTitle: 'Docs',
            },
            {
                title: 'Button',
                url: '/ui-components/button',
                icon: 'common',
                category: 'Common',
                categoryTitle: 'UI Components',
            },
        ],
    },
]

const ListItem = (props: {
    icon: string
    label: string
    url: string
    isLast?: boolean
    keyWord: string
    onNavigate: () => void
}) => {
    const { icon, label, url = '', isLast, keyWord, onNavigate } = props

    const { textTheme } = useThemeClass()

    return (
        <Link to={url} onClick={onNavigate}>
            <div
                className={classNames(
                    'flex items-center justify-between rounded-lg p-3.5 cursor-pointer user-select',
                    'bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700/90',
                    !isLast && 'mb-3',
                )}
            >
                <div className="flex items-center">
                    <div
                        className={classNames(
                            'mr-4 rounded-md ring-1 ring-slate-900/5 shadow-sm text-xl group-hover:shadow h-6 w-6 flex items-center justify-center bg-white dark:bg-gray-700',
                            textTheme,
                            'dark:text-gray-100',
                        )}
                    >
                        {icon && navigationIcon[icon]}
                    </div>
                    <div className="text-gray-900 dark:text-gray-300">
                        <Highlighter
                            autoEscape
                            highlightClassName={classNames(
                                textTheme,
                                'underline bg-transparent font-semibold dark:text-white',
                            )}
                            searchWords={[keyWord]}
                            textToHighlight={label}
                        />
                    </div>
                </div>
                <HiChevronRight className="text-lg" />
            </div>
        </Link>
    )
}

const _Search = ({ className }: { className?: string }) => {
    const [searchDialogOpen, setSearchDialogOpen] = useState(false)
    const [searchResult, setSearchResult] =
        useState<SearchResult[]>(recommendedSearch)
    const [noResult, setNoResult] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)

    const handleReset = () => {
        setNoResult(false)
        setSearchResult(recommendedSearch)
    }

    const handleSearchOpen = () => {
        setSearchDialogOpen(true)
    }

    const handleSearchClose = () => {
        setSearchDialogOpen(false)
        if (noResult) {
            setTimeout(() => {
                handleReset()
            }, 300)
        }
    }

    const debounceFn = debounce(handleDebounceFn, 200)

    async function handleDebounceFn(query: string) {
        if (!query) {
            setSearchResult(recommendedSearch)
            return
        }

        if (noResult) {
            setNoResult(false)
        }
        const respond = await apiGetSearchResult<SearchResult[]>({ query })
        if (respond.data) {
            if (respond.data.length === 0) {
                setNoResult(true)
            }
            setSearchResult(respond.data)
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    useEffect(() => {
        if (searchDialogOpen) {
            const timeout = setTimeout(() => inputRef.current?.focus(), 100)
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [searchDialogOpen])

    const handleNavigate = () => {
        handleSearchClose()
    }

    return <></>
}

const Search = withHeaderItem(_Search)

export default Search
