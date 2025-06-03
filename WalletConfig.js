// WalletConfig.js

import Web3 from "web3";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import traducao from "./Traducao";

const web3 = new Web3("https://bsc-dataseed.binance.org/");
window.web3 = web3;

/**
 * Cria uma nova wallet, criptografa a chave privada e salva os dados no localStorage.
 * Após a criação, chama a função displayWalletInfo com o endereço da conta criada.
 *
 * @param {string} password
 * @param {function} displayWalletInfo 
 * @param {string} language
 */
function createWallet(password, displayWalletInfo, language) {
  try {
    const account = web3.eth.accounts.create();
    const encrypted = web3.eth.accounts.encrypt(account.privateKey, password);

    localStorage.setItem("encryptedPrivateKey", JSON.stringify(encrypted));
    localStorage.setItem("publicAddress", account.address);





    Swal.fire({
      title: traducao[language].attention_title,
      html: `
        <p style="margin-bottom:10px; color: #fdd835; font-weight: bold; font-size: 1.1rem;">
          ${traducao[language].private_key_title.toUpperCase()} 🔐
        </p>
        <p style="color:#fff; font-size: 0.9rem; text-align: justify;">
          ${traducao[language].private_key_warning}
        </p>
        <div id="privateKeyBox" style="
          background: #222;
          color: #0f0;
          font-weight: bold;
          border: 1px solid #0f0;
          border-radius: 6px;
          padding: 10px;
          margin-top: 15px;
          cursor: pointer;
          user-select: all;
        ">
          ${account.privateKey}
        </div>
        <small style="display:block; margin-top: 10px; color:#aaa; font-size:0.85rem;">
          ${traducao[language].copiar_endereco}
        </small>
      `,
      icon: "warning",
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: { popup: "fixed-modal" },
      didOpen: () => {
        const keyBox = document.getElementById("privateKeyBox");
        keyBox.addEventListener("click", () => {
          navigator.clipboard.writeText(account.privateKey)
            .then(() => {
              Swal.close();
              Swal.fire({
                title: traducao[language].wallet_created,
                icon: "success",
                confirmButtonText: traducao[language].ok_button,
              });
              displayWalletInfo(account.address);
            })
            .catch(() => {
              Swal.fire(traducao[language].error_title, "Clipboard error", "error");
            });
        });
      },
    });
  } catch (e) {
    console.error(e);
    Swal.fire(
      traducao[language].error_title,
      traducao[language].error_create_wallet,
      "error"
    );
  }
}

/**
 * Importa uma wallet a partir de uma chave privada fornecida pelo usuário.
 * Se a importação for bem-sucedida, chama displayWalletInfo com o endereço importado.
 *
 * @param {function} displayWalletInfo 
 * @param {string} language 
 */
async function importWallet(displayWalletInfo, language) {
  const { value: privateKey } = await Swal.fire({
    title: traducao[language].importar_wallet,
    input: "text",
    inputLabel: traducao[language].enter_private_key,
    inputPlaceholder: "0x...",
    showCancelButton: true,
    confirmButtonText: traducao[language].import_button,
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage(traducao[language].validation_empty_private_key);
        return null;
      }
      let cleanedKey = value.replace(/[\u200B-\u200D\uFEFF\s\n\r]+/g, "").trim();
      if (!cleanedKey.startsWith("0x")) {
        cleanedKey = "0x" + cleanedKey;
      }
      if (cleanedKey.length !== 66) {
        Swal.showValidationMessage(traducao[language].error_invalid_private_key);
        return null;
      }
      try {
        web3.eth.accounts.privateKeyToAccount(cleanedKey);
        return cleanedKey;
      } catch (e) {
        Swal.showValidationMessage(traducao[language].invalid_private_key_format);
        return null;
      }
    },
  });

  if (!privateKey) return;

  await Swal.fire({
    title: traducao[language].define_secure_password,
    html: `
      <p style="margin-bottom:10px;">${traducao[language].create_wallet_description}</p>
      <button type="button" id="toggle-password-visibility-import" style="background:none; border:none; cursor:pointer; outline:none; margin-bottom: 8px;">
        <svg id="eye-open-import" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
        </svg>
        <svg id="eye-closed-import" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24" style="display:none;">
          <path d="M12 5c-3.86 0-7.3 2.15-9 5.5.78 1.56 1.91 2.89 3.3 3.9l-1.3 1.3 1.4 1.4 14-14-1.4-1.4-3.1 3.1A9.83 9.83 0 0 0 12 5Zm0 14c3.86 0 7.3-2.15 9-5.5a10.78 10.78 0 0 0-2.71-3.59l-1.43 1.43a5.5 5.5 0 0 1-7.2 7.2l-1.43 1.43A9.83 9.83 0 0 0 12 19Z"/>
        </svg>
      </button>

      <input type="password" id="import-wallet-password" class="swal2-input" placeholder="${traducao[language].new_password_placeholder}">
      <input type="password" id="confirm-import-wallet-password" class="swal2-input" placeholder="${traducao[language].confirm_new_password_placeholder}" style="margin-top:10px;">

      <small id="import-password-hint" style="color: #f00; display: none;">
        ${traducao[language].new_password_criteria}
      </small>
    `,
    confirmButtonText: traducao[language].encrypt_button,
    allowOutsideClick: false,
    customClass: { popup: "fixed-modal" },
    preConfirm: () => {
      const newPassword = document.getElementById("import-wallet-password").value;
      const confirmNewPassword = document.getElementById("confirm-import-wallet-password").value;
      const passwordHint = document.getElementById("import-password-hint");

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{11,}$/;

      if (!newPassword || !confirmNewPassword) {
        passwordHint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_fill_both);
      }

      if (!passwordRegex.test(newPassword)) {
        passwordHint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_criteria);
      }

      if (newPassword !== confirmNewPassword) {
        passwordHint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_mismatch);
      }

      return newPassword;
    },
    didOpen: () => {
      document.body.style.overflow = "hidden";
      document
        .getElementById("toggle-password-visibility-import")
        .addEventListener("click", () => {
          ["import-wallet-password", "confirm-import-wallet-password"].forEach((id) => {
            const input = document.getElementById(id);
            input.type = input.type === "password" ? "text" : "password";
          });
          const isPwd =
            document.getElementById("import-wallet-password").type === "password";
          document.getElementById("eye-open-import").style.display = isPwd
            ? "block"
            : "none";
          document.getElementById("eye-closed-import").style.display = isPwd
            ? "none"
            : "block";
        });
    },
    willClose: () => {
      document.body.style.overflow = "";
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const encrypted = web3.eth.accounts.encrypt(privateKey, result.value);
      localStorage.setItem("encryptedPrivateKey", JSON.stringify(encrypted));
      localStorage.setItem("publicAddress", account.address);

    



      Swal.fire({
        title: traducao[language].wallet_imported,
        html: `${traducao[language].wallet_imported_message}<br>${traducao[language].wallet_address_label}: ${account.address}`,
        icon: "success",
        confirmButtonText: traducao[language].ok_button,
      });
      displayWalletInfo(account.address);
    }
  });
}

/**
 * Exibe um popup para que o usuário defina a senha da wallet.
 * Ao confirmar a senha, chama createWallet passando displayWalletInfo e language.
 *
 * @param {function} displayWalletInfo 
 * @param {string} language
 */
function promptCreateWalletPassword(displayWalletInfo, language) {
  Swal.fire({
    title: traducao[language].criar_wallet,
    html: `
      <p style="margin-bottom:10px;">${traducao[language].create_wallet_description}</p>
      <button type="button" id="toggle-password-visibility" style="background:none; border:none; cursor:pointer; outline:none; margin-bottom:8px;">
        <svg id="eye-open" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
        </svg>
        <svg id="eye-closed" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24" style="display:none;">
          <path d="M12 5c-3.86 0-7.3 2.15-9 5.5.78 1.56 1.91 2.89 3.3 3.9l-1.3 1.3 1.4 1.4 14-14-1.4-1.4-3.1 3.1A9.83 9.83 0 0 0 12 5Zm0 14c3.86 0 7.3-2.15 9-5.5a10.78 10.78 0 0 0-2.71-3.59l-1.43 1.43a5.5 5.5 0 0 1-7.2 7.2l-1.43 1.43A9.83 9.83 0 0 0 12 19Z"/>
        </svg>
      </button>

      <input type="password" id="wallet-password" class="swal2-input" placeholder="${traducao[language].enter_password}">
      <input type="password" id="wallet-password-confirm" class="swal2-input" placeholder="${traducao[language].confirm_password}" style="margin-top:10px;">

      <small id="wallet-password-hint" style="color: #f00; display: none;">
        ${traducao[language].password_criteria_hint}
      </small>
    `,
    confirmButtonText: traducao[language].criar_wallet,
    allowOutsideClick: false,
    customClass: { popup: "fixed-modal" },
    preConfirm: () => {
      const password = document.getElementById("wallet-password").value;
      const confirmPassword = document.getElementById("wallet-password-confirm").value;
      const passwordHint = document.getElementById("wallet-password-hint");

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{11,}$/;

      if (!password || !confirmPassword) {
        passwordHint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_fill_both);
      }

      if (!passwordRegex.test(password)) {
        passwordHint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_criteria);
      }

      if (password !== confirmPassword) {
        passwordHint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_mismatch);
      }

      return password;
    },
    didOpen: () => {
      document.body.style.overflow = "hidden";
      const btn = document.getElementById("toggle-password-visibility");
      btn.addEventListener("click", () => {
        ["wallet-password", "wallet-password-confirm"].forEach((id) => {
          const input = document.getElementById(id);
          input.type = input.type === "password" ? "text" : "password";
        });
        const isPwd = document.getElementById("wallet-password").type === "password";
        document.getElementById("eye-open").style.display = isPwd ? "block" : "none";
        document.getElementById("eye-closed").style.display = isPwd ? "none" : "block";
      });
    },
    willClose: () => {
      document.body.style.overflow = "";
    },
  }).then((result) => {
    if (result.isConfirmed) {
      createWallet(result.value, displayWalletInfo, language);
    }
  });
}

/**
 * Reseta a wallet.
 * todos os dados serão apagados.
 *
 * @param {function} displayWalletInfo 
 * @param {string} language
 */

function clearLocalStorageAndResetWallet(displayWalletInfo, language){
    Swal.fire({
        title: traducao[language].attention_title,
        html: `
        <p style="color:red; font-weight:bold;">
            ${traducao[language].reset_warning}
        </p>
        <p>
            ${traducao[language].reset_instruction}
        </p>
        <p style="font-weight:bold;">
            ${traducao[language].hold_instruction}
        </p>
        <div id="progress-container" style="
            width: 100%;
            height: 8px;
            background: #ddd;
            margin-top: 10px;
            border-radius: 5px;
            overflow: hidden;
            position: relative;">
            <div id="progress-bar" style="
                width: 0%;
                height: 100%;
                background: red;
                position: absolute;
                left: 0;
                top: 0;
                transition: width linear;"></div>
        </div>
        <div id="hold-button" style="
            margin-top: 15px;
            width: 100%;
            padding: 10px;
            background: red;
            color: white;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
        ">
            ${traducao[language].hold_button_text}
        </div>
        `,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: traducao[language].cancel_button,
        didOpen: () => {
            const holdButton = document.getElementById("hold-button");
            const progressBar = document.getElementById("progress-bar");

            let holdTime = 0;
            let interval = null;

            // Adiciona os eventos para iniciar e parar a contagem
            holdButton.addEventListener("mousedown", startHold);
            holdButton.addEventListener("touchstart", startHold);
            holdButton.addEventListener("mouseup", stopHold);
            holdButton.addEventListener("mouseleave", stopHold);
            holdButton.addEventListener("touchend", stopHold);

            function startHold() {
                if (interval) return; // Evita múltiplas execuções

                holdTime = 0;
                progressBar.style.width = "0%";

                interval = setInterval(() => {
                    holdTime += 100; // Incrementa a cada 100ms
                    let progress = (holdTime / 2000) * 100;
                    progressBar.style.width = `${progress}%`;

                    if (holdTime >= 2000) { // Se segurar por 2 segundos
                        clearInterval(interval);
                        interval = null; // Libera para futuras execuções
                        resetWallet();
                    }
                }, 100);
            }

            function stopHold() {
                clearInterval(interval);
                interval = null; // Libera para futuras execuções
                holdTime = 0;
                progressBar.style.width = "0%";
            }

            function resetWallet() {
                localStorage.clear();
                Swal.fire({
                    title: traducao[language].wallet_reset_title,
                    text: traducao[language].wallet_reset_text,
                    icon: "success",
                    allowOutsideClick: false,
                    timer: 2000,
                    didClose: () => window.location.reload()
                });
            }
        }
    });
}

/**
 * Exibe a chave privada da wallet.
 * Não necessita de parâmetros adicionais.
 *
 * @param {function} displayWalletInfo 
 * @param {string} language
 */
async function showPrivateKey(displayWalletInfo, language) {
  const encrypted = localStorage.getItem("encryptedPrivateKey");
  if (!encrypted) {
    Swal.fire({
      title: traducao[language].error_title,
      text: traducao[language].error_no_wallet,
      icon: "error",
    });
    return;
  }

  const { value: pwd } = await Swal.fire({
    title: traducao[language].enter_current_password,
    html: `
      <button type="button" id="toggle-password-visibility-show" style="background:none; border:none; cursor:pointer; outline:none; margin-bottom:8px;">
        <svg id="eye-open-show" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
        </svg>
      </button>
      <input type="password" id="show-privatekey-password" class="swal2-input" placeholder="${traducao[language].enter_current_password}">
    `,
    confirmButtonText: traducao[language].show_button,
    showCancelButton: true,
    preConfirm: () => document.getElementById("show-privatekey-password").value,
    didOpen: () => {
      const btn = document.getElementById("toggle-password-visibility-show");
      btn.onclick = () => {
        const input = document.getElementById("show-privatekey-password");
        input.type = input.type === "password" ? "text" : "password";
      };
    },
  });

  if (!pwd) return;

  try {
    const acct = web3.eth.accounts.decrypt(JSON.parse(encrypted), pwd);

    await Swal.fire({
      title: traducao[language].private_key_title,
      html: `
        <div id="copyKeyBox" style="word-break: break-all; cursor: pointer;">
          ${acct.privateKey}
        </div>
        <small style="color:#f00;display:block;margin-top:10px;">
          ${traducao[language].private_key_warning}
        </small>
      `,
      icon: "info",
      confirmButtonText: traducao[language].ok_button,
      didOpen: () => {
        const box = document.getElementById("copyKeyBox");
        box.addEventListener("click", () => {
          navigator.clipboard.writeText(acct.privateKey)
            .then(() => {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: traducao[language].private_key_copied,
                showConfirmButton: false,
                timer: 1500,
              });
            })
            .catch(() => {
              Swal.fire("Erro", "Não foi possível copiar", "error");
            });
        });
      },
    });
  } catch (e) {
    Swal.fire(
      traducao[language].error_title,
      traducao[language].incorrect_password,
      "error"
    );
  }
}


/**
 * Troca a senha da wallet.
 *
 * @param {function} displayWalletInfo 
 * @param {string} language 
 */
async function changeWalletPassword(displayWalletInfo, language) {
  const encrypted = localStorage.getItem("encryptedPrivateKey");
  if (!encrypted) {
    Swal.fire({
      title: traducao[language].error_title,
      text: traducao[language].error_no_wallet,
      icon: "error",
    });
    return;
  }

  const { value: oldPwd } = await Swal.fire({
    title: traducao[language].enter_current_password,
    html: `
      <button type="button" id="toggle-old-password-visibility" style="background:none; border:none; cursor:pointer; outline:none; margin-bottom:8px;">
        <svg id="eye-open-old" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
        </svg>
      </button>
      <input type="password" id="old-wallet-password" class="swal2-input" placeholder="${traducao[language].enter_current_password}">
    `,
    confirmButtonText: traducao[language].confirm_button,
    showCancelButton: true,
    preConfirm: () => {
      const pwd = document.getElementById("old-wallet-password").value;
      if (!pwd) Swal.showValidationMessage(traducao[language].validation_fill_both);
      return pwd;
    },
    didOpen: () => {
      document.getElementById("toggle-old-password-visibility").onclick = () => {
        const input = document.getElementById("old-wallet-password");
        input.type = input.type === "password" ? "text" : "password";
      };
    },
  });

  if (!oldPwd) return;

  let acct;
  try {
    acct = web3.eth.accounts.decrypt(JSON.parse(localStorage.getItem("encryptedPrivateKey")), oldPwd);
  } catch (e) {
    Swal.fire({
      title: traducao[language].error_title,
      text: traducao[language].incorrect_password,
      icon: "error",
    });
    return;
  }

  await Swal.fire({
    title: traducao[language].new_password_title,
    html: `
      <p style="margin-bottom:10px;">${traducao[language].new_password_description}</p>
      <button type="button" id="toggle-new-password-visibility" style="background:none; border:none; cursor:pointer; outline:none; margin-bottom:8px;">
        <svg id="eye-open-new" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
        </svg>
      </button>
      <input type="password" id="new-wallet-password" class="swal2-input" placeholder="${traducao[language].new_password_placeholder}">
      <input type="password" id="confirm-new-wallet-password" class="swal2-input" placeholder="${traducao[language].confirm_new_password_placeholder}" style="margin-top:10px;">
      <small id="change-password-hint" style="color:#f00;display:none;">
        ${traducao[language].new_password_criteria}
      </small>
    `,
    confirmButtonText: traducao[language].change_button,
    allowOutsideClick: false,
    customClass: { popup: "fixed-modal" },
    preConfirm: () => {
      const pwd = document.getElementById("new-wallet-password").value;
      const confirmPwd = document.getElementById("confirm-new-wallet-password").value;
      const hint = document.getElementById("change-password-hint");
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{11,}$/;
      if (!pwd || !confirmPwd) {
        hint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_fill_both);
      }
      if (!regex.test(pwd)) {
        hint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_criteria);
      }
      if (pwd !== confirmPwd) {
        hint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_mismatch);
      }
      return pwd;
    },
    didOpen: () => {
      document.getElementById("toggle-new-password-visibility").onclick = () => {
        ["new-wallet-password", "confirm-new-wallet-password"].forEach((id) => {
          const input = document.getElementById(id);
          input.type = input.type === "password" ? "text" : "password";
        });
      };
    },
  }).then((res) => {
    if (res.isConfirmed) {
      const reEncrypted = web3.eth.accounts.encrypt(acct.privateKey, res.value);
      localStorage.setItem("encryptedPrivateKey", JSON.stringify(reEncrypted));
      Swal.fire(
        traducao[language].success_title,
        traducao[language].success_password_changed,
        "success"
      );
    }
  });
}

/**
 * Reseta a senha da wallet.
 */
async function resetWalletPassword(displayWalletInfo, language) {
  const stored = localStorage.getItem("publicAddress");
  if (!stored) {
    Swal.fire({
      title: traducao[language].error_title,
      text: traducao[language].error_no_wallet,
      icon: "error",
    });
    return;
  }

  const { value: privKey } = await Swal.fire({
    title: traducao[language].reset_password_title,
    input: "textarea",
    inputLabel: traducao[language].paste_private_key,
    inputPlaceholder: "0x...",
    confirmButtonText: traducao[language].continue_button,
    showCancelButton: true,
    preConfirm: (value) => {
      if (!value || !value.startsWith("0x") || value.length !== 66) {
        Swal.showValidationMessage(traducao[language].error_invalid_private_key);
        return null;
      }
      return value;
    },
  });

  if (!stored || !privKey) return;

  let acct;
  try {
    acct = web3.eth.accounts.privateKeyToAccount(privKey);
    if (acct.address.toLowerCase() !== stored.toLowerCase()) {
      Swal.fire(
        traducao[language].error_title,
        traducao[language].error_private_key_mismatch,
        "error"
      );
      return;
    }
  } catch (e) {
    Swal.fire(
      traducao[language].error_title,
      traducao[language].error_invalid_private_key,
      "error"
    );
    return;
  }

  await Swal.fire({
    title: traducao[language].define_new_password,
    html: `
      <p style="margin-bottom:10px;">${traducao[language].new_password_description}</p>
      <button type="button" id="toggle-password-visibility-reset" style="background:none; border:none; cursor:pointer; outline:none; margin-bottom:8px;">
        <svg id="eye-open-reset" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#555" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 0 0 11Zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
        </svg>
      </button>
      <input type="password" id="reset-wallet-password" class="swal2-input" placeholder="${traducao[language].new_password_placeholder}">
      <input type="password" id="confirm-reset-wallet-password" class="swal2-input" placeholder="${traducao[language].confirm_new_password_placeholder}" style="margin-top:10px;">
      <small id="reset-password-hint" style="color:#f00;display:none;">
        ${traducao[language].new_password_criteria}
      </small>
    `,
    confirmButtonText: traducao[language].reset_button,
    allowOutsideClick: false,
    customClass: { popup: "fixed-modal" },
    preConfirm: () => {
      const newPwd = document.getElementById("reset-wallet-password").value;
      const confirmPwd = document.getElementById("confirm-reset-wallet-password").value;
      const hint = document.getElementById("reset-password-hint");
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{11,}$/;
      if (!newPwd || !confirmPwd) {
        hint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_fill_both);
      }
      if (!regex.test(newPwd)) {
        hint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_criteria);
      }
      if (newPwd !== confirmPwd) {
        hint.style.display = "block";
        return Swal.showValidationMessage(traducao[language].validation_mismatch);
      }
      return newPwd;
    },
    didOpen: () => {
      document.body.style.overflow = "hidden";
      document.getElementById("toggle-password-visibility-reset").onclick = () => {
        ["reset-wallet-password", "confirm-reset-wallet-password"].forEach((id) => {
          const input = document.getElementById(id);
          input.type = input.type === "password" ? "text" : "password";
        });
      };
    },
    willClose: () => {
      document.body.style.overflow = "";
    },
  }).then((res) => {
    if (res.isConfirmed) {
      const reEncrypted = web3.eth.accounts.encrypt(acct.privateKey, res.value);
      localStorage.setItem("encryptedPrivateKey", JSON.stringify(reEncrypted));
      localStorage.setItem("publicAddress", acct.address);
      Swal.fire(
        traducao[language].success_title,
        traducao[language].success_password_reset,
        "success"
      );
    }
  });
}

export {
  createWallet,
  importWallet,
  promptCreateWalletPassword,
  clearLocalStorageAndResetWallet,
  showPrivateKey,
  changeWalletPassword,
  resetWalletPassword,
};
