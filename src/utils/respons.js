/**
 * Membangun objek respons API yang konsisten.
 * @param {boolean} success - Status keberhasilan operasi.
 * @param {string} message - Pesan yang menjelaskan hasil operasi.
 * @param {object | null} [data=null] - Data yang dikirim jika sukses.
 * @param {string | null} [token=null] - Token akses (misalnya setelah login).
 * @param {object | null} [error=null] - Detail error jika operasi gagal.
 * @returns {object} Objek respons API yang terstruktur.
 */
const buildResponse = (
  success,
  message,
  data = null,
  token = null,
  error = null
) => {
  // Objek dasar respons
  const response = {
    success: success,
    message: message,
  };

  // Tambahkan token hanya jika disediakan
  if (token) {
    response.token = token;
  }

  // Jika sukses, gunakan kunci 'data'
  if (success) {
    response.data = data;
  } else {
    // Jika gagal, gunakan kunci 'error'
    response.error = error || { code: "GENERAL_ERROR" };
  }

  return response;
};

// Ekspor fungsi agar bisa digunakan di file controller Anda
module.exports = {
  buildResponse,
};
