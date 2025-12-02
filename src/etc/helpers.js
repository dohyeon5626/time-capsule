export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateSimple = (dateInput) => {
  const date = new Date(dateInput);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:00`;
};

export const calculateTimeLeft = (targetDateStr) => {
  const difference = +new Date(targetDateStr) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const length = phoneNumber.length;
  if (length < 4) return phoneNumber;
  if (length < 8) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
    3,
    7
  )}-${phoneNumber.slice(7, 11)}`;
};

export const isValidPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  return /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/.test(cleaned);
};

export const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

export const reSizeImageUrl = (file) => {
    const MAX_DIMENSION = 400;
    const JPEG_QUALITY = 0.8;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    } else {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#0f172a"; 
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const base64String = canvas.toDataURL('image/jpeg', JPEG_QUALITY); 
                
                resolve(base64String);
            };
        };

        reader.readAsDataURL(file);
    });
};

export const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.readAsDataURL(file);
    });
};

export const b64ToBlob = (b64Data, contentType = 'application/octet-stream') => {
    const byteString = atob(b64Data);
    
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([int8Array], { type: contentType });
}

export const logFormDataEntries = (formData) => { // 테스트용
    console.log("--- 📥 FormData 내용 시작 📥 ---");
    for (const [key, value] of formData.entries()) {
        if (value instanceof File || value instanceof Blob) {
            console.log(`🔑 ${key}: [File/Blob] Name: ${value.name || 'N/A'}, Size: ${(value.size / 1024).toFixed(2)} KB, Type: ${value.type}`);
        } else {
            console.log(`🔑 ${key}: ${String(value)}`);
        }
    }
    console.log("--- 📤 FormData 내용 끝 📤 ---");
}
