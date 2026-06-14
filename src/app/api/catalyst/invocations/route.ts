import { NextResponse } from 'next/server'
import { BedrockRuntimeClient, ListAsyncInvokesCommand } from '@aws-sdk/client-bedrock-runtime'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })

export async function GET() {
  try {
    const res = await bedrock.send(new ListAsyncInvokesCommand({
      maxResults: 20,
      sortBy: 'SubmissionTime',
      sortOrder: 'Descending',
    }))

    const invocations = (res.asyncInvokeSummaries || []).map(inv => ({
      arn: inv.invocationArn,
      status: inv.status,
      submitTime: inv.submitTime,
      endTime: inv.endTime,
    }))

    const inProgress = invocations.filter(i => i.status === 'InProgress')
    return NextResponse.json({ invocations, in_progress: inProgress.length, total: invocations.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
