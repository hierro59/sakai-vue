import { ref, onMounted } from 'vue';
import { publicClient } from '@/main.js';
import tinycolor from 'tinycolor2';
import { i18n } from '@/i18n'


export function useCompanyStyles() {
    // Variables reactivas
    const company = ref(null);
    const companyLogo = ref(null);
    const faviconUrl = ref(null);
    const isLoading = ref(true); // Estado de carga


    // Función para generar la paleta de colores
    function generateColorPalette(primaryColor, secondaryColor) {
        const primary = tinycolor(primaryColor);
        const secondary = tinycolor(secondaryColor);

        if (!primary.isValid() || !secondary.isValid()) {
            console.error('Colores no válidos:', primaryColor, secondaryColor);
            return null;
        }

        return {
            primary: primary.toHexString(),
            primaryContrast: primary.isLight() ? '#000000' : '#FFFFFF',
            primaryHover: primary.setAlpha(0.5).toRgbString(),
            secondary: secondary.toHexString(),
            secondaryContrast: secondary.isLight() ? '#000000' : '#FFFFFF',
            secondaryHover: secondary.setAlpha(0.5).toRgbString(),
            textColor: primary.isLight() ? '#F97316' : primary.isLight(),
            textColorSecondary: secondary.isLight() ? secondary.isLight() : '#CCCCCC',
            surfaceBorder: primary.setAlpha(0.1).toRgbString(),
            surfaceCard: primary.isLight() ? '#F97316' : primary.isLight(),
            surfaceHover: primary.setAlpha(0.05).toRgbString(),
            surfaceOverlay: primary.isLight() ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            maskbg: primary.isLight() ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        };
    }

    // Función para obtener los datos de la empresa
    const fetchCompanyData = async () => {
        try {
            const response = await publicClient.get(`/tenant/settings`);
            company.value = response.data.data;

            // Configuración de logos y favicon por defecto
            companyLogo.value = company.value.logo_url || `/images/LogoMetis.svg`;
            faviconUrl.value = company.value.favicon_url || `/images/owl.ico`;
            i18n.global.locale.value = company.value.language || 'en';
            // Aplicar estilos personalizados
            applyCustomStyles();
        } catch (error) {
            console.error('Error fetching company data:', error);
        } finally {
            isLoading.value = false; // Finaliza la carga
        }
    };

    // Función para aplicar los estilos personalizados
    const applyCustomStyles = () => {
        if (company.value?.primary_color && company.value?.secondary_color) {
            const palette = generateColorPalette(company.value.primary_color, company.value.secondary_color);

            if (!palette) {
                console.error('No se pudo generar la paleta de colores.');
                return;
            }

            // Actualiza las variables CSS globales
            document.documentElement.style.setProperty('--primary-color', palette.primary);
            document.documentElement.style.setProperty('--primary-contrast-color', palette.primaryContrast);
            document.documentElement.style.setProperty('--text-color', palette.textColor);
            document.documentElement.style.setProperty('--text-color-secondary', palette.textColorSecondary);
            document.documentElement.style.setProperty('--p-button-primary-background', palette.primary);
            document.documentElement.style.setProperty('--p-button-primary-color', palette.primaryContrast);
            document.documentElement.style.setProperty('--p-button-secondary-background', palette.secondary);
            document.documentElement.style.setProperty('--p-button-secondary-color', palette.primaryContrast);
        } else {
            console.error('Datos de la empresa no válidos.');
        }
    };

    // Hook onMounted para ejecutar fetchCompanyData cuando el componente se monta
    onMounted(() => {
        fetchCompanyData();
    });

    return { company, companyLogo, isLoading, faviconUrl };
}
