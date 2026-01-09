interface Navigator {
    usb: USB;
}

interface USB {
    requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>;
}

interface USBDevice {
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
    open(): Promise<void>;
    selectConfiguration(config: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    configuration?: any;
}

interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
}
