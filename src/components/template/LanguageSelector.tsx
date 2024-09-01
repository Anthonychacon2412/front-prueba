import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import Spinner from '@/components/ui/Spinner'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { setLang, useAppSelector, useAppDispatch } from '@/store'
import { dateLocales } from '@/locales'
import dayjs from 'dayjs'
// eslint-disable-next-line import/no-named-as-default
import i18n from 'i18next'
import { HiCheck } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'

const languageList = [
    { label: 'English', value: 'en', flag: 'us' },
    { label: 'Chinese', value: 'zhCn', flag: 'cn' },
    { label: 'Espanol', value: 'es', flag: 'sp' },
    { label: 'Arabic', value: 'ar', flag: 'ar' },
]

const _LanguageSelector = ({ className }: CommonProps) => {
    const [loading, setLoading] = useState(false)
    const locale = useAppSelector((state) => state.locale.currentLang)
    const dispatch = useAppDispatch()

    const selectLangFlag = useMemo(() => {
        return languageList.find((lang) => lang.value === locale)?.flag
    }, [locale])

    const selectedLanguage = (
        <div className={classNames(className, 'flex items-center')}>
            {loading ? (
                <Spinner size={20} />
            ) : (
                <Avatar
                    size={24}
                    shape="circle"
                    src={`/img/countries/${selectLangFlag}.png`}
                />
            )}
        </div>
    )

    const onLanguageSelect = (lang: string) => {
        const formattedLang = lang.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase()
        })

        setLoading(true)

        const dispatchLang = () => {
            i18n.changeLanguage(formattedLang)
            dispatch(setLang(lang))
            setLoading(false)
        }

        dateLocales[formattedLang]()
            .then(() => {
                dayjs.locale(formattedLang)
                dispatchLang()
            })
            .catch(() => {
                dispatchLang()
            })
    }

    return <></>
}

const LanguageSelector = withHeaderItem(_LanguageSelector)

export default LanguageSelector
