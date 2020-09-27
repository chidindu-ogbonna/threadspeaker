/**
 * Build data from firestore document snapshot
 * @param {firebase.firestore.DocumentSnapshot} snap
 */
export const buildData = (snap) => {
  return { id: snap.id, ...snap.data() }
}

export const toDateTime = (item) => {
  let seconds

  if (item instanceof Number) {
    seconds = item
  } else if (item.seconds) {
    seconds = item.seconds
  } else {
    seconds = item
  }

  const t = new Date(1970, 0, 1) // Epoch

  t.setSeconds(seconds)
  return t
}
