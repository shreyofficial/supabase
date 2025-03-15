import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Session } from '@supabase/supabase-js'
import TicketCanvas from '~/components/LaunchWeek/14/TicketCanvas'
import DefaultLayout from '~/components/Layouts/Default'
import SectionContainer from '~/components/Layouts/SectionContainer'
import { TicketState, ConfDataContext, UserData } from '~/components/LaunchWeek/hooks/use-conf-data'
import { LW14_DATE, LW14_TITLE, LW14_URL, SITE_ORIGIN } from '~/lib/constants'
import { TicketLayout, TicketLayoutCanvas } from '~/components/LaunchWeek/14/TicketLayout'
import {
  TicketHeader,
  TicketHeaderClaim,
  TicketHeaderDate,
  TicketHeaderRemainingTime,
} from '~/components/LaunchWeek/14/Header'

const dates = [new Date('2025-03-24T12:00:00Z')]

const Lw14Page = () => {
  const { query } = useRouter()

  const TITLE = `${LW14_TITLE} | ${LW14_DATE}`
  const DESCRIPTION = 'Join us for a week of announcing new features, every day at 7 AM PT.'
  const OG_IMAGE = `${SITE_ORIGIN}/images/launchweek/14/lw14-og.png?lw=14`

  const ticketNumber = query.ticketNumber?.toString()
  const [session, setSession] = useState<Session | null>(null)
  const [showCustomizationForm, setShowCustomizationForm] = useState<boolean>(false)

  const defaultUserData = {
    id: query.id?.toString(),
    ticket_number: ticketNumber ? parseInt(ticketNumber, 10) : undefined,
    name: query.name?.toString(),
    username: query.username?.toString(),
    platinum: !!query.platinum,
  }

  const [userData, setUserData] = useState<UserData>(defaultUserData)
  const [ticketState, setTicketState] = useState<TicketState>('loading')

  return (
    <>
      <NextSeo
        title={TITLE}
        description={DESCRIPTION}
        openGraph={{
          title: TITLE,
          description: DESCRIPTION,
          url: LW14_URL,
          images: [
            {
              url: OG_IMAGE,
            },
          ],
        }}
      />
      <DefaultLayout className='font-["Departure_Mono"]'>
        <SectionContainer id="ticket" className="relative !max-w-none lw-nav-anchor">
          <TicketLayout>
            <TicketHeader>
              <TicketHeaderRemainingTime targetDate={dates[0]} />
              <TicketHeaderClaim />
              <TicketHeaderDate />
            </TicketHeader>
            <TicketLayoutCanvas>
              <TicketCanvas
                secret={userData.secret}
                platinum={userData.platinum}
                playmodeRTChannel={{}}
                user={{
                  id: userData.id,
                  name: userData.name,
                  ticketNumber: userData.ticket_number,
                }}
                startDate={dates[0]}
              />
            </TicketLayoutCanvas>
          </TicketLayout>
        </SectionContainer>
      </DefaultLayout>
    </>
  )
}

export default Lw14Page
