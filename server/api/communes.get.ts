import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const query = getQuery(event)

  let queryBuilder = supabase
    .from('communes')
    .select('id, code, nom, population, maire')
    .order('nom')

  // Filtrer par code si fourni
  if (query.code) {
    queryBuilder = queryBuilder.eq('code', query.code)
  }

  const { data, error } = await queryBuilder

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})
