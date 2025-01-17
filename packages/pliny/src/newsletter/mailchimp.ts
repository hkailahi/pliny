import { NextApiRequest, NextApiResponse } from 'next'
import mailchimp from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER, // E.g. us1
})

export const mailchimpHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email } = req.body

  const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
    email_address: email,
    status: 'subscribed',
  })
  return response
}
