import "./App.css";
import { ModalsWrapper } from "./components/modals/modalsWrapper";
import { ModalProvider } from "./state/modals";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ItineraryProvider } from "./state/itineraryProvider";
import { SectionProvider } from "./state/sectionProvider";
import { PageWrapper } from "./pages/pageWrapper";
import { FieldProvider } from "./state/fieldProvider";
import { ValueProvider } from "./state/valueProvider";
import { DataSourceProvider } from "./state/dataSourceProvider";
import { SheetProvider } from "./state/sheetProvider";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#CEDC00",
        dark: "#9EA800",
        light: "#CEDC00",
        contrastText: "#17221C",
      },
    },
    typography: {
      h1: { fontFamily: "bebas-neue-pro" },
      h2: { fontFamily: "bebas-neue-pro" },
      h3: { fontFamily: "bebas-neue-pro", textTransform: "uppercase" },
      h4: { fontFamily: "bebas-neue-pro", textTransform: "uppercase" },
      h5: { fontFamily: "bebas-neue-pro", textTransform: "uppercase" },
      h6: {
        fontFamily: "urbane",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "16px",
      },
      fontFamily: "urbane",
    },
    overrides: {
      MuiButton: { root: { borderRadius: "0px" } },
      MuiInput: { root: { width: "350px" } },
      MuiSelect: { root: { border: "solid 1px", paddingLeft: "8px" } },
      MuiFormLabel: { root: { fontWeight: 600, color: "rgba(0, 0, 0, 1)" } },
      MuiTextField: {
        root: {
          width: "350px",
        },
      },
    },
  });

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <ItineraryProvider>
          <SectionProvider>
            <FieldProvider>
              <ValueProvider>
                <DataSourceProvider>
                  <SheetProvider>
                    <ModalProvider>
                      <ModalsWrapper></ModalsWrapper>
                      <PageWrapper></PageWrapper>
                    </ModalProvider>
                  </SheetProvider>
                </DataSourceProvider>
              </ValueProvider>
            </FieldProvider>
          </SectionProvider>
        </ItineraryProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
