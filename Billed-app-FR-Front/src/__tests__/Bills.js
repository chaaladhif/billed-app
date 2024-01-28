/*/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import  Bills from "../containers/Bills.js";
import { ROUTES,ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //to-do write expect expression
      // j'ai ajouté cette ligne pour vérifier que l'icône de la fenêtre est en surbrillance
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
  // test ajouter sur la vision d'une facture
  describe("When I click on the eye icon of a bill", () => {
    test("It should open a modal", async () => {
       // Mise en place de l'environnement de test
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      //console.log('test');
      // Initialisation de la classe Bills
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });
      //console.log('testt2');

      const handleClickIconEye = jest.fn(icon => billsContainer.handleClickIconEye(icon));
      const iconEye = await screen.getAllByTestId("icon-eye");
      const modaleFile = document.getElementById("modaleFile");

      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

      iconEye.forEach(icon => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });
      expect(modaleFile).toBeTruthy();
    });
  });
  //test unitaire 2
  describe("Given I am connected as an employee and I am on Bills page", () => {
    describe("When I click on 'Nouvelle note de frais' button", () => {
      test("I should be sent to 'Envoyer une note de frais' page", () => {
        // Mise en place de l'environnement de test
        const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
  
        // Initialisation de la classe Bills
        const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
        document.body.innerHTML = BillsUI({ data: bills });
  
        const handleClickNewBill = jest.fn(icon => billsContainer.handleClickNewBill(icon));
        const btnNewBill = screen.getByTestId("btn-new-bill");
        btnNewBill.addEventListener("click", handleClickNewBill);        
      // Simulation du clic sur le bouton "Nouvelle note de frais"
        userEvent.click(btnNewBill);
  
        // Vérification de la navigation vers la page "Envoyer une note de frais"
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();

      });
    });
  });

//test d'integration getBills
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      // Vérification de l'affichage du type de note de frais
      const contentPending = await screen.getAllByText("Restaurants et bars");
      expect(contentPending).toBeTruthy();

      const contentRefused = await screen.getAllByText("Transports");
      expect(contentRefused).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        // Mise en place du mockStore et localStorage
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        // Configuration du mockStore pour rejeter avec une erreur 404
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 404"))
        }));

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const errorMessage = await screen.getByText(/Erreur 404/);
        expect(errorMessage).toBeTruthy();
      });
      // Erreur 500
      test("fetches bills from an API and fails with 500 message error", async () => {
        // Configuration du mockStore pour rejeter avec une erreur 500
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 500"))
        }));

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const errorMessage = await screen.getByText(/Erreur 500/);
        expect(errorMessage).toBeTruthy();
      });
    });
  });
});