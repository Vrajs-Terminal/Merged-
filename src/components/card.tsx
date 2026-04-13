type CardProps = {
    title: string;
    value: string;
};

function Card({ title, value }: CardProps) {
    return (
        <div className="card">
            <p className="card-title">{title}</p>
            <h3 className="card-value">{value}</h3>
        </div>
    );
}

export default Card;
