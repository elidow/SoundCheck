import './PageHeader.css';

/*
 * PageHeader
 * Header component for each page
 */
const PageHeader = ({ title }) => {
    return (
        <header className="Page-Header">
            <p>{title}</p>
        </header>
    );
};

export default PageHeader;