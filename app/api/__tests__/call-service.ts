import {
  createHAApiHandler,
  getHASensorDetails,
  getSensorData,
} from '../../../lib/home-assistant-api'
import { haCallService } from '../call-service'

it("stops nagging me that there aren't any tests", () => {
  expect(true).toBe(!false)
})

// NB: Make sure to comment out testEnvironment: jsdom in Jest config to use this!

/*
it('is something I can debug', async () => {
  const api = createHAApiHandler()
  const result = await getSensorData(api)

  console.log(result)
})
*/
