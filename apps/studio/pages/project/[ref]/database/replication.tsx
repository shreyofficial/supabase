import DatabaseLayout from 'components/layouts/DatabaseLayout/DatabaseLayout'
import type { NextPageWithLayout } from 'types'
import { FormHeader } from 'components/ui/Forms/FormHeader'
import Destinations from 'components/interfaces/Database/Replication/Destinations'
import { ScaffoldContainer, ScaffoldSection } from 'components/layouts/Scaffold'
import DefaultLayout from 'components/layouts/DefaultLayout'
import { useFlag } from 'hooks/ui/useFlag'

const DatabaseReplicationPage: NextPageWithLayout = () => {
  const enablePgReplicate = useFlag('enablePgReplicate')
  return (
    <>
      {enablePgReplicate ? (
        <ScaffoldContainer>
          <ScaffoldSection>
            <div className="col-span-12">
              <FormHeader
                title="Database Replication"
                description="Send data to other destinations"
              />
            </div>
          </ScaffoldSection>
          <ScaffoldSection>
            <div className="col-span-12">
              <Destinations />
            </div>
          </ScaffoldSection>
        </ScaffoldContainer>
      ) : (
        <ScaffoldContainer>
          <ScaffoldSection>
            <div className="col-span-12">
              <FormHeader
                title="Feature Unavailable"
                description="This feature is not available for you"
              />
            </div>
          </ScaffoldSection>
        </ScaffoldContainer>
      )}
    </>
  )
}

DatabaseReplicationPage.getLayout = (page) => (
  <DefaultLayout>
    <DatabaseLayout title="Database">{page}</DatabaseLayout>
  </DefaultLayout>
)

export default DatabaseReplicationPage
