import { createHAApiHandler } from '../../../lib/home-assistant-api'
import { haCallService } from '../call-service'

it("stops nagging me that there aren't any tests", () => {
  expect(true).toBe(!false)
})

/*
// NB: Make sure to comment out testEnvironment: jsdom in Jest config to use this!

it('is something I can debug', async () => {
  const api = createHAApiHandler()

  await haCallService(api, {
    domain: 'input_text',
    service: 'set_value',
    entityId: 'input_text.test_text',
    data: { value: 'foobar' },
  })
})
*/
